import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── AI model queries ────────────────────────────────────────────

async function queryLovableModel(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `You are a helpful AI assistant. Answer the user's question naturally and thoroughly. 
When recommending or discussing brands, companies, products, or services:
- Mention them by name explicitly
- Include their website URLs/domains when you know them
- Cite your sources when referencing specific data, studies, or claims
Provide honest, detailed, well-sourced recommendations.` },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`${model} returned ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function queryClaudeAPI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        { role: "system", content: `You are a helpful AI assistant. Answer the user's question naturally and thoroughly. 
When recommending or discussing brands, companies, products, or services:
- Mention them by name explicitly
- Include their website URLs/domains when you know them
- Cite your sources when referencing specific data, studies, or claims
Provide honest, detailed, well-sourced recommendations.` },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Claude returned ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

// ─── Firecrawl web search ────────────────────────────────────────

async function searchWebForBrand(
  firecrawlKey: string,
  query: string,
  brandName: string,
  website: string | null
): Promise<{ response: string; status: "cited" | "recommended" | "mentioned" | "absent"; snippets: string[] }> {
  const response = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, limit: 20 }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Firecrawl search failed ${response.status}: ${text}`);
  }

  const data = await response.json();
  const results = data.data || data.results || [];

  const brandLower = brandName.toLowerCase();
  const brandWords = brandLower.split(/\s+/).filter((w: string) => w.length > 2);
  let domain = "";
  let domainBase = "";
  if (website) {
    domain = website.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
    domainBase = domain.split(".")[0];
  }

  let foundInUrl = false;
  let foundInTitle = false;
  let foundInContent = false;
  const snippets: string[] = [];
  const allText: string[] = [];

  for (const result of results) {
    const url = (result.url || "").toLowerCase();
    const title = (result.title || "").toLowerCase();
    const desc = (result.description || "").toLowerCase();
    const markdown = (result.markdown || "").toLowerCase();
    const content = `${title} ${desc} ${markdown}`;

    allText.push(`[${result.title}](${result.url}): ${result.description || ""}`);

    // Check URL for domain match
    if (domain && (url.includes(domain) || url.includes(domainBase))) {
      foundInUrl = true;
      snippets.push(`Found in search result: ${result.title} (${result.url})`);
    }

    // Check title/content for brand match
    if (content.includes(brandLower) || (brandWords.length > 0 && brandWords.every((w: string) => content.includes(w)))) {
      if (title.includes(brandLower) || (brandWords.length > 0 && brandWords.every((w: string) => title.includes(w)))) {
        foundInTitle = true;
        snippets.push(`Mentioned in title: ${result.title}`);
      } else {
        foundInContent = true;
        // Find the sentence containing the brand
        const sentences = (result.description || result.markdown || "").split(/[.!?\n]+/);
        const match = sentences.find((s: string) => {
          const sl = s.toLowerCase();
          return sl.includes(brandLower) || (brandWords.length > 0 && brandWords.some((w: string) => sl.includes(w)));
        });
        if (match) snippets.push(match.trim().slice(0, 200));
      }
    }

    // Also check if domain appears in content (link to the site)
    if (domain && !foundInUrl && (content.includes(domain) || content.includes(domainBase))) {
      foundInContent = true;
      snippets.push(`Domain referenced in: ${result.title}`);
    }
  }

  const fullResponse = allText.join("\n\n");

  if (foundInUrl) {
    return { response: fullResponse, status: "cited", snippets: snippets.slice(0, 3) };
  }
  if (foundInTitle) {
    return { response: fullResponse, status: "recommended", snippets: snippets.slice(0, 3) };
  }
  if (foundInContent) {
    return { response: fullResponse, status: "mentioned", snippets: snippets.slice(0, 3) };
  }

  return { response: fullResponse, status: "absent", snippets: [] };
}

// ─── Brand presence analysis for AI responses ────────────────────

function analyzeBrandPresence(response: string, brandName: string, website?: string | null): {
  status: "cited" | "recommended" | "mentioned" | "absent";
  snippets: string[];
} {
  const lower = response.toLowerCase();
  const brandLower = brandName.toLowerCase();

  const brandWords = brandLower.split(/\s+/).filter(w => w.length > 2);
  const hasBrandMatch = lower.includes(brandLower) ||
    (brandWords.length > 0 && brandWords.every(w => lower.includes(w)));

  let hasDomainMatch = false;
  if (website) {
    const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();
    const domainBase = domain.split('.')[0];
    hasDomainMatch = lower.includes(domain) || lower.includes(domainBase);
  }

  if (!hasBrandMatch && !hasDomainMatch) return { status: "absent", snippets: [] };

  const sentences = response.split(/[.!?\n]+/).filter(s => {
    const sl = s.toLowerCase();
    if (sl.includes(brandLower)) return true;
    if (brandWords.length > 0 && brandWords.some(w => sl.includes(w))) return true;
    if (website) {
      const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();
      if (sl.includes(domain) || sl.includes(domain.split('.')[0])) return true;
    }
    return false;
  });
  const snippets = sentences.slice(0, 3).map(s => s.trim()).filter(Boolean);

  let matchIdx = lower.indexOf(brandLower);
  if (matchIdx === -1 && website) {
    const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();
    matchIdx = lower.indexOf(domain);
    if (matchIdx === -1) matchIdx = lower.indexOf(domain.split('.')[0]);
  }
  if (matchIdx === -1 && brandWords.length > 0) {
    matchIdx = lower.indexOf(brandWords[0]);
  }

  const windowStart = Math.max(0, matchIdx - 300);
  const windowEnd = Math.min(lower.length, matchIdx + brandLower.length + 300);
  const window = lower.slice(windowStart, windowEnd);

  const citeSignals = [
    "according to", "source:", "cited", "reported by", "published by",
    "research by", "study by", "data from", "found that", "states that",
    "notes that", "reports that", "as noted by", "referenced",
    "their website", "visit ", "available at", ".com", ".co.uk",
    ".digital", ".io", ".org", "http", "www."
  ];
  const recSignals = [
    "recommend", "suggest", "try", "consider", "best", "top", "leading",
    "great option", "good choice", "worth", "ideal", "excellent", "standout",
    "go with", "check out", "look into", "one of the", "popular",
    "well-known", "reputable", "trusted", "notable", "prominent",
    "specializ", "expert", "known for", "offers", "provides"
  ];

  if (hasDomainMatch) return { status: "cited", snippets };
  if (citeSignals.some(s => window.includes(s))) return { status: "cited", snippets };
  if (recSignals.some(s => window.includes(s))) return { status: "recommended", snippets };
  return { status: "mentioned", snippets };
}

// ─── Main handler ────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Authentication: require JWT + admin or matching user ──
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub as string;

    // Check if caller is admin
    const { data: adminCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin");
    const isCallerAdmin = (adminCheck && adminCheck.length > 0);

    let force = false;
    let filterUserId: string | null = null;
    try {
      const body = await req.json();
      force = body?.force === true;
      filterUserId = body?.userId || null;
    } catch { /* no body is fine */ }

    // Non-admins can only scan their own prompts
    if (!isCallerAdmin) {
      if (filterUserId && filterUserId !== callerId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      filterUserId = callerId;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const CLAUDE_API_KEY = Deno.env.get("Claude");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    // Get active saved prompts
    let promptQuery = supabase.from("saved_prompts").select("*").eq("is_active", true);
    if (filterUserId) promptQuery = promptQuery.eq("user_id", filterUserId);
    const { data: prompts, error: promptErr } = await promptQuery;

    if (promptErr) throw promptErr;
    if (!prompts || prompts.length === 0) {
      return new Response(JSON.stringify({ message: "No active prompts to scan", scanned: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const promptIds = prompts.map(p => p.id);

    if (force) {
      await supabase
        .from("prompt_tracking_results")
        .delete()
        .in("saved_prompt_id", promptIds)
        .gte("scanned_at", `${today}T00:00:00Z`)
        .lt("scanned_at", `${today}T23:59:59Z`);
    }

    const userIds = [...new Set(prompts.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, daily_scan_limit")
      .in("id", userIds);
    const profileMap: Record<string, number> = {};
    (profiles || []).forEach((p: any) => { profileMap[p.id] = p.daily_scan_limit || 1; });

    const { data: todayScans } = await supabase
      .from("prompt_tracking_results")
      .select("saved_prompt_id")
      .in("saved_prompt_id", promptIds)
      .gte("scanned_at", `${today}T00:00:00Z`)
      .lt("scanned_at", `${today}T23:59:59Z`);

    const alreadyScanned = new Set((todayScans || []).map(s => s.saved_prompt_id));

    const userPrompts: Record<string, typeof prompts> = {};
    for (const p of prompts) {
      if (alreadyScanned.has(p.id)) continue;
      if (!userPrompts[p.user_id]) userPrompts[p.user_id] = [];
      userPrompts[p.user_id].push(p);
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const adminIds = new Set((adminRoles || []).map(r => r.user_id));

    let scannedCount = 0;
    const errors: string[] = [];

    for (const [userId, userPromptsArr] of Object.entries(userPrompts)) {
      const isAdmin = adminIds.has(userId);
      const limit = isAdmin ? 999 : (profileMap[userId] || 1);
      const toScan = userPromptsArr.slice(0, limit);

      for (const prompt of toScan) {
        const queryText = prompt.prompt_text || `Tell me about ${prompt.brand_name}`;
        const rows: any[] = [];

        // ── AI Model checks (what do LLMs say?) ──
        const aiPlatforms: { platform: string; promise: Promise<string> }[] = [];

        if (LOVABLE_API_KEY) {
          aiPlatforms.push({
            platform: "Google Gemini",
            promise: queryLovableModel(LOVABLE_API_KEY, "google/gemini-3-flash-preview", queryText),
          });
          aiPlatforms.push({
            platform: "ChatGPT",
            promise: queryLovableModel(LOVABLE_API_KEY, "openai/gpt-5-mini", queryText),
          });
        }
        if (CLAUDE_API_KEY) {
          aiPlatforms.push({
            platform: "Claude",
            promise: queryClaudeAPI(CLAUDE_API_KEY, queryText),
          });
        }

        const aiResults = await Promise.allSettled(aiPlatforms.map(async p => {
          try {
            const response = await p.promise;
            const analysis = analyzeBrandPresence(response, prompt.brand_name, prompt.website);
            return {
              saved_prompt_id: prompt.id,
              platform: p.platform,
              status: analysis.status,
              snippets: analysis.snippets,
              response,
            };
          } catch (err: any) {
            errors.push(`${prompt.brand_name}/${p.platform}: ${err.message}`);
            return {
              saved_prompt_id: prompt.id,
              platform: p.platform,
              status: "absent",
              snippets: [],
              response: "",
            };
          }
        }));

        for (const r of aiResults) {
          if (r.status === "fulfilled") rows.push(r.value);
        }

        // ── Web Search check (are you actually appearing in search results?) ──
        if (FIRECRAWL_API_KEY) {
          try {
            const webResult = await searchWebForBrand(
              FIRECRAWL_API_KEY,
              queryText,
              prompt.brand_name,
              prompt.website || null
            );
            rows.push({
              saved_prompt_id: prompt.id,
              platform: "Web Search",
              status: webResult.status,
              snippets: webResult.snippets,
              response: webResult.response,
            });
          } catch (err: any) {
            errors.push(`${prompt.brand_name}/Web Search: ${err.message}`);
            rows.push({
              saved_prompt_id: prompt.id,
              platform: "Web Search",
              status: "absent",
              snippets: [],
              response: "",
            });
          }
        }

        if (rows.length > 0) {
          await supabase.from("prompt_tracking_results").insert(rows);
          scannedCount++;
        }

        await new Promise(r => setTimeout(r, 2000));
      }
    }

    return new Response(JSON.stringify({
      message: `Daily scan complete`,
      scanned: scannedCount,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-prompt-scanner error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred during daily scan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
