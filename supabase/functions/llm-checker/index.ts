import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 5;
const TOOL_NAME = "llm-checker";

function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function checkAndRecordUsage(supabase: any, ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("tool_usage")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .in("tool_name", ["llm-checker", "llm-prompt-tester"])
    .gte("created_at", oneDayAgo);

  if (error) {
    console.error("Usage check error:", error);
    return { allowed: true, remaining: 0 };
  }

  const used = count || 0;
  if (used >= DAILY_LIMIT) return { allowed: false, remaining: 0 };

  await supabase.from("tool_usage").insert({ ip_address: ip, tool_name: TOOL_NAME });
  return { allowed: true, remaining: DAILY_LIMIT - used - 1 };
}

// ── Step 1: Scrape homepage with Firecrawl ──────────────────────
async function scrapeHomepage(url: string, apiKey: string): Promise<{ markdown: string; links: string[]; title: string; description: string } | null> {
  try {
    console.log("Scraping homepage:", url);
    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown", "links"], onlyMainContent: false }),
    });
    if (!resp.ok) { console.error("Firecrawl error:", resp.status); return null; }
    const raw = await resp.json();
    const d = raw.data || raw;
    return {
      markdown: (d.markdown || "").slice(0, 3000),
      links: (d.links || []).slice(0, 30),
      title: d.metadata?.title || "",
      description: d.metadata?.description || "",
    };
  } catch (e) { console.error("Scrape failed:", e); return null; }
}

// ── Step 2: Ahrefs domain metrics ───────────────────────────────
async function getAhrefsMetrics(domain: string, apiKey: string): Promise<any | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const drUrl = `https://api.ahrefs.com/v3/site-explorer/domain-rating?target=${encodeURIComponent(domain)}&date=${today}`;
    const metricsUrl = `https://api.ahrefs.com/v3/site-explorer/metrics?target=${encodeURIComponent(domain)}&date=${today}&mode=subdomains`;

    const [drResp, metricsResp] = await Promise.all([
      fetch(drUrl, { headers: { Authorization: `Bearer ${apiKey}` } }),
      fetch(metricsUrl, { headers: { Authorization: `Bearer ${apiKey}` } }),
    ]);

    const dr = drResp.ok ? await drResp.json() : null;
    const metrics = metricsResp.ok ? await metricsResp.json() : null;

    console.log("Ahrefs DR:", dr?.domain_rating, "Traffic:", metrics?.metrics?.org_traffic);

    return {
      domainRating: dr?.domain_rating ?? null,
      orgTraffic: metrics?.metrics?.org_traffic ?? null,
      orgKeywords: metrics?.metrics?.org_keywords ?? null,
      orgKeywords1_3: metrics?.metrics?.org_keywords_1_3 ?? null,
      paidKeywords: metrics?.metrics?.paid_keywords ?? null,
      refDomains: metrics?.metrics?.refdomains ?? null,
    };
  } catch (e) { console.error("Ahrefs error:", e); return null; }
}

// ── Step 3: AI extracts business info from scraped content ──────
async function extractBusinessInfo(scrapeContent: string, brandName: string, apiKey: string): Promise<{
  industry: string; location: string; services: string[]; description: string;
}> {
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Extract business information from website content. Return ONLY valid JSON." },
          { role: "user", content: `From this website content for "${brandName}", extract:
1. What industry/sector they are in
2. Where they are based (city, country)
3. Their main services/products (list of 3-5)
4. A one-line description of what they do

Content: ${scrapeContent.slice(0, 2000)}

Return JSON: {"industry":"","location":"","services":[],"description":""}` },
        ],
      }),
    });
    if (!resp.ok) throw new Error("AI extraction failed");
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "";
    const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(json);
  } catch (e) {
    console.error("Business extraction failed:", e);
    return { industry: "unknown", location: "unknown", services: [brandName], description: brandName };
  }
}

// ── Step 4: Generate contextual prompts ─────────────────────────
function generatePrompts(brand: string, info: { industry: string; location: string; services: string[]; description: string }): string[] {
  const loc = info.location !== "unknown" ? info.location : "";
  const svc = info.services.length > 0 ? info.services[0] : info.industry;

  const prompts = [
    `Who are the best ${info.industry} companies${loc ? ` in ${loc}` : ""}? List the top options with reasons.`,
    `I need a ${svc} provider${loc ? ` in ${loc}` : ""}. Who would you recommend and why?`,
    `What is ${brand} and what do they do? Are they reputable?`,
    `How much is ${brand} mentioned online? Are they a well-known brand in ${info.industry}?`,
  ];

  if (info.services.length > 1) {
    prompts.push(`Who provides the best ${info.services[1]}${loc ? ` in ${loc}` : ""}?`);
  }

  return prompts;
}

// ── Step 5: Query LLMs with prompts ─────────────────────────────
async function queryLLM(apiKey: string, model: string, prompt: string): Promise<string> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Answer naturally and thoroughly. When discussing brands, mention them by name, include website URLs when known, and cite sources." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`${model} error ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

async function queryClaudeAPI(apiKey: string, prompt: string): Promise<string> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) throw new Error(`Claude error ${resp.status}`);
  const data = await resp.json();
  return data.content?.[0]?.text || "";
}

// ── Step 6: Analyze brand presence in LLM responses ─────────────
function analyzeBrandPresence(response: string, brandName: string, website?: string): {
  status: "cited" | "recommended" | "mentioned" | "absent";
  snippets: string[];
} {
  const lower = response.toLowerCase();
  const brandLower = brandName.toLowerCase();
  const brandWords = brandLower.split(/\s+/).filter(w => w.length > 2);
  const hasBrandMatch = lower.includes(brandLower) || (brandWords.length > 0 && brandWords.every(w => lower.includes(w)));

  let hasDomainMatch = false;
  if (website) {
    const domain = website.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
    hasDomainMatch = lower.includes(domain);
  }

  if (!hasBrandMatch && !hasDomainMatch) return { status: "absent", snippets: [] };

  const sentences = response.split(/[.!?\n]+/).filter(s => {
    const sl = s.toLowerCase();
    return sl.includes(brandLower) || brandWords.some(w => sl.includes(w)) ||
      (website && sl.includes(website.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase()));
  });
  const snippets = sentences.slice(0, 3).map(s => s.trim()).filter(Boolean);

  if (hasDomainMatch) return { status: "cited", snippets };

  const matchIdx = lower.indexOf(brandLower);
  if (matchIdx === -1) return { status: "mentioned", snippets };
  const window = lower.slice(Math.max(0, matchIdx - 300), Math.min(lower.length, matchIdx + 300));

  const citeSignals = ["according to", "source:", "cited", "reported by", "published by", "data from", ".com", ".co.uk", "http", "www."];
  const recSignals = ["recommend", "suggest", "best", "top", "leading", "great option", "consider", "well-known", "reputable", "trusted"];

  if (citeSignals.some(s => window.includes(s))) return { status: "cited", snippets };
  if (recSignals.some(s => window.includes(s))) return { status: "recommended", snippets };
  return { status: "mentioned", snippets };
}

// ── Step 7: Score calculation ───────────────────────────────────
function calculateScores(
  llmResults: { platform: string; prompt: string; status: string }[],
  ahrefsData: any | null,
) {
  // Platform-level scores from actual LLM queries
  const platformMap: Record<string, { total: number; found: number; cited: number; recommended: number }> = {};

  for (const r of llmResults) {
    if (!platformMap[r.platform]) platformMap[r.platform] = { total: 0, found: 0, cited: 0, recommended: 0 };
    platformMap[r.platform].total++;
    if (r.status !== "absent" && r.status !== "error") platformMap[r.platform].found++;
    if (r.status === "cited") platformMap[r.platform].cited++;
    if (r.status === "recommended") platformMap[r.platform].recommended++;
  }

  const platforms = Object.entries(platformMap).map(([name, stats]) => {
    const score = Math.round((stats.cited * 100 + stats.recommended * 70 + (stats.found - stats.cited - stats.recommended) * 40) / stats.total);
    const status = score >= 70 ? "strong" : score >= 40 ? "moderate" : score > 0 ? "weak" : "not found";
    return { name, score, status, queriesRun: stats.total, timesFound: stats.found, timesCited: stats.cited };
  });

  // Overall visibility score (weighted)
  const llmScore = platforms.length > 0
    ? Math.round(platforms.reduce((sum, p) => sum + p.score, 0) / platforms.length)
    : 0;

  // Ahrefs contributes to "digital presence" but doesn't dominate
  let ahrefsBonus = 0;
  if (ahrefsData?.domainRating) {
    ahrefsBonus = Math.min(15, Math.round(ahrefsData.domainRating * 0.15));
  }

  const overallScore = Math.min(100, Math.round(llmScore * 0.85 + ahrefsBonus));

  return { platforms, overallScore, llmScore };
}

// ═══════════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { brandName, website, name, email, saveLead, organisation, contactPermission, overallScore, results } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle lead capture (no rate limit cost)
    if (saveLead) {
      if (!name || !email || !brandName) {
        return new Response(JSON.stringify({ error: "Name, email, and brand are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase.from("llm_checker_leads").insert({
        name: String(name).slice(0, 100),
        email: String(email).slice(0, 255),
        brand_name: String(brandName).slice(0, 100),
        website: organisation ? String(organisation).slice(0, 200) : null,
        overall_score: typeof overallScore === "number" ? overallScore : null,
        results: results || null,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!brandName || typeof brandName !== "string" || brandName.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid brand name" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit check
    const clientIp = getClientIp(req);
    const { allowed, remaining } = await checkAndRecordUsage(supabase, clientIp);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "You've reached your daily limit of 5 free checks. Come back tomorrow or book a consultation.", rateLimited: true, remaining: 0 }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const CLAUDE_API_KEY = Deno.env.get("Claude");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const AHREFS_API_KEY = Deno.env.get("ahrefs");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Format website URL
    let formattedUrl = website?.trim() || "";
    if (formattedUrl && !formattedUrl.startsWith("http")) formattedUrl = `https://${formattedUrl}`;
    const domain = formattedUrl ? formattedUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "") : "";

    console.log(`=== AI Visibility Check: ${brandName} (${domain || "no website"}) ===`);

    // ── PARALLEL STEP 1: Scrape + Ahrefs (independent) ──────────
    const [scrapeData, ahrefsData] = await Promise.all([
      FIRECRAWL_API_KEY && formattedUrl ? scrapeHomepage(formattedUrl, FIRECRAWL_API_KEY) : Promise.resolve(null),
      AHREFS_API_KEY && domain ? getAhrefsMetrics(domain, AHREFS_API_KEY) : Promise.resolve(null),
    ]);

    // ── STEP 2: Extract business info from scrape ───────────────
    let businessInfo = { industry: "their industry", location: "unknown", services: [brandName], description: brandName };
    if (scrapeData) {
      businessInfo = await extractBusinessInfo(
        `Title: ${scrapeData.title}\nDescription: ${scrapeData.description}\n\n${scrapeData.markdown}`,
        brandName,
        LOVABLE_API_KEY,
      );
      console.log("Business info extracted:", JSON.stringify(businessInfo));
    }

    // ── STEP 3: Generate contextual prompts ─────────────────────
    const prompts = generatePrompts(brandName, businessInfo);
    console.log("Generated prompts:", prompts);

    // ── STEP 4: Query all LLMs with all prompts in parallel ─────
    type LLMResult = { platform: string; prompt: string; response: string; status: string; snippets: string[] };
    const llmPromises: Promise<LLMResult>[] = [];

    for (const prompt of prompts) {
      // Gemini
      llmPromises.push(
        queryLLM(LOVABLE_API_KEY, "google/gemini-3-flash-preview", prompt)
          .then(r => {
            const a = analyzeBrandPresence(r, brandName, formattedUrl);
            return { platform: "Google Gemini", prompt, response: r, ...a };
          })
          .catch(() => ({ platform: "Google Gemini", prompt, response: "", status: "error", snippets: [] })),
      );
      // ChatGPT
      llmPromises.push(
        queryLLM(LOVABLE_API_KEY, "openai/gpt-5-mini", prompt)
          .then(r => {
            const a = analyzeBrandPresence(r, brandName, formattedUrl);
            return { platform: "ChatGPT", prompt, response: r, ...a };
          })
          .catch(() => ({ platform: "ChatGPT", prompt, response: "", status: "error", snippets: [] })),
      );
      // Claude
      if (CLAUDE_API_KEY) {
        llmPromises.push(
          queryClaudeAPI(CLAUDE_API_KEY, prompt)
            .then(r => {
              const a = analyzeBrandPresence(r, brandName, formattedUrl);
              return { platform: "Claude", prompt, response: r, ...a };
            })
            .catch(() => ({ platform: "Claude", prompt, response: "", status: "error", snippets: [] })),
        );
      }
    }

    const llmResults = await Promise.all(llmPromises);
    console.log(`LLM queries complete: ${llmResults.length} results`);

    // ── STEP 5: Calculate scores ────────────────────────────────
    const { platforms, overallScore: calcScore, llmScore } = calculateScores(llmResults, ahrefsData);

    // ── STEP 6: AI generates summary using real data ────────────
    const summaryContext = `
Brand: ${brandName}
Website: ${domain || "not provided"}
Industry: ${businessInfo.industry}
Location: ${businessInfo.location}
Services: ${businessInfo.services.join(", ")}

REAL LLM QUERY RESULTS (${llmResults.length} queries across ${platforms.length} platforms):
${platforms.map(p => `- ${p.name}: Score ${p.score}/100, found in ${p.timesFound}/${p.queriesRun} queries, cited ${p.timesCited} times`).join("\n")}

${ahrefsData ? `REAL AHREFS DATA:
- Domain Rating: ${ahrefsData.domainRating ?? "N/A"}/100
- Organic Traffic: ${ahrefsData.orgTraffic ?? "N/A"} monthly visits
- Organic Keywords: ${ahrefsData.orgKeywords ?? "N/A"}
- Top 3 Keywords: ${ahrefsData.orgKeywords1_3 ?? "N/A"}
- Referring Domains: ${ahrefsData.refDomains ?? "N/A"}` : "No Ahrefs data available"}

Sample prompts tested: ${prompts.slice(0, 3).join(" | ")}

Prompts where brand was FOUND:
${llmResults.filter(r => r.status !== "absent" && r.status !== "error").map(r => `- [${r.platform}] "${r.prompt.slice(0, 60)}..." → ${r.status}`).join("\n") || "None"}

Prompts where brand was ABSENT:
${llmResults.filter(r => r.status === "absent").map(r => `- [${r.platform}] "${r.prompt.slice(0, 60)}..."`).join("\n") || "None"}`;

    const summaryResp = await queryLLM(LOVABLE_API_KEY, "google/gemini-2.5-flash-lite", `You are an AI visibility analyst for Wolfstone Digital. Based on REAL data from actual LLM queries and Ahrefs metrics, write a brief analysis.

${summaryContext}

Return ONLY valid JSON:
{
  "summary": "2-3 sentence executive summary based on the real data above",
  "strengths": ["2-3 real strengths based on actual findings"],
  "weaknesses": ["2-3 real weaknesses based on actual findings"],
  "recommendations": [
    {"priority": "high"|"medium"|"low", "action": "specific actionable recommendation", "impact": "expected impact"}
  ],
  "competitorContext": "1-2 sentences about competitive landscape based on what LLMs recommended instead"
}`);

    let summaryData: any = {};
    try {
      const json = summaryResp.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      summaryData = JSON.parse(json);
    } catch { summaryData = { summary: "Analysis complete — see detailed results below.", strengths: [], weaknesses: [], recommendations: [], competitorContext: "" }; }

    // ── Build response ──────────────────────────────────────────
    const response = {
      brandName,
      overallScore: calcScore,
      summary: summaryData.summary,
      methodology: "live-query", // tells frontend this is real data
      businessInfo,
      platforms: platforms.map(p => ({
        name: p.name,
        score: p.score,
        status: p.status as "strong" | "moderate" | "weak" | "not found",
        detail: `Found in ${p.timesFound} of ${p.queriesRun} test queries. Cited ${p.timesCited} time(s).`,
        queriesRun: p.queriesRun,
        timesFound: p.timesFound,
        timesCited: p.timesCited,
      })),
      promptResults: llmResults.map(r => ({
        platform: r.platform,
        prompt: r.prompt,
        status: r.status,
        snippets: r.snippets,
        // Don't send full responses to keep payload small — snippets are enough
      })),
      ahrefs: ahrefsData ? {
        domainRating: ahrefsData.domainRating,
        orgTraffic: ahrefsData.orgTraffic,
        orgKeywords: ahrefsData.orgKeywords,
        refDomains: ahrefsData.refDomains,
      } : null,
      strengths: summaryData.strengths || [],
      weaknesses: summaryData.weaknesses || [],
      recommendations: summaryData.recommendations || [],
      competitorContext: summaryData.competitorContext || "",
      remaining,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("llm-checker error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
