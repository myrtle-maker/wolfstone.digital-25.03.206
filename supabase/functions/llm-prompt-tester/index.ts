import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 5;
const TOOL_NAME = "llm-prompt-tester";

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
- If a company is well-known in the space, explain why
Provide honest, detailed, well-sourced recommendations.` },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`${model} error:`, response.status, text);
    throw new Error(`${model} returned ${response.status}`);
  }

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
- If a company is well-known in the space, explain why
Provide honest, detailed, well-sourced recommendations.` },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Claude API error:", response.status, text);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}

function analyzeBrandPresence(response: string, brandName: string, website?: string | null): {
  status: "cited" | "recommended" | "mentioned" | "absent";
  snippets: string[];
} {
  const lower = response.toLowerCase();
  const brandLower = brandName.toLowerCase();

  // Check for brand name match (including partial/fuzzy)
  const brandWords = brandLower.split(/\s+/).filter(w => w.length > 2);
  const hasBrandMatch = lower.includes(brandLower) ||
    (brandWords.length > 0 && brandWords.every(w => lower.includes(w)));

  // Check for website/domain match
  let hasDomainMatch = false;
  if (website) {
    const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();
    const domainBase = domain.split('.')[0];
    hasDomainMatch = lower.includes(domain) || lower.includes(domainBase);
  }

  if (!hasBrandMatch && !hasDomainMatch) return { status: "absent", snippets: [] };

  // Extract relevant sentences
  const sentences = response.split(/[.!?\n]+/).filter(s => {
    const sl = s.toLowerCase();
    if (sl.includes(brandLower)) return true;
    if (brandWords.length > 0 && brandWords.some(w => sl.includes(w))) return true;
    if (website) {
      const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();
      const domainBase = domain.split('.')[0];
      if (sl.includes(domain) || sl.includes(domainBase)) return true;
    }
    return false;
  });
  const snippets = sentences.slice(0, 3).map(s => s.trim()).filter(Boolean);

  // Context window around first match
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
    "according to", "source:", "cited", "reported by", "published by", "as reported",
    "research by", "study by", "data from", "found that", "states that",
    "notes that", "reports that", "per ", "as noted by", "referenced",
    "their website", "their site", "visit ", "available at", ".com", ".co.uk",
    ".digital", ".io", ".org", "http", "www.", "url"
  ];
  const recSignals = [
    "recommend", "suggest", "try", "consider", "best", "top", "leading",
    "great option", "good choice", "worth", "ideal", "excellent", "standout",
    "go with", "check out", "look into", "one of the", "popular",
    "well-known", "reputable", "trusted", "notable", "prominent",
    "specializ", "expert", "known for", "offers", "provides"
  ];

  const hasCite = citeSignals.some(s => window.includes(s));
  const hasRec = recSignals.some(s => window.includes(s));

  if (hasDomainMatch) return { status: "cited", snippets };
  if (hasCite) return { status: "cited", snippets };
  if (hasRec) return { status: "recommended", snippets };
  return { status: "mentioned", snippets };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandName, prompt, website } = await req.json();

    if (!brandName || typeof brandName !== "string" || brandName.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid brand name" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!prompt || typeof prompt !== "string" || prompt.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid prompt (max 500 characters)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const clientIp = getClientIp(req);
    const { allowed, remaining } = await checkAndRecordUsage(supabase, clientIp);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "You've reached your daily limit of 5 free checks. Come back tomorrow or book a consultation for a full analysis.",
          rateLimited: true, remaining: 0,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const CLAUDE_API_KEY = Deno.env.get("Claude");
    if (!LOVABLE_API_KEY && !CLAUDE_API_KEY) throw new Error("No API keys configured");

    const promises: Promise<{ platform: string; response: string }>[] = [];

    if (LOVABLE_API_KEY) {
      promises.push(
        queryLovableModel(LOVABLE_API_KEY, "google/gemini-3-flash-preview", prompt)
          .then(r => ({ platform: "Google Gemini", response: r }))
          .catch(e => ({ platform: "Google Gemini", response: "" })),
        queryLovableModel(LOVABLE_API_KEY, "openai/gpt-5-mini", prompt)
          .then(r => ({ platform: "ChatGPT", response: r }))
          .catch(e => ({ platform: "ChatGPT", response: "" })),
      );
    }

    if (CLAUDE_API_KEY) {
      promises.push(
        queryClaudeAPI(CLAUDE_API_KEY, prompt)
          .then(r => ({ platform: "Claude", response: r }))
          .catch(e => ({ platform: "Claude", response: "" })),
      );
    }

    const settled = await Promise.all(promises);

    const results = settled.map(({ platform, response }) => {
      if (!response) {
        return { platform, response: "", status: "error" as const, snippets: [], error: `Failed to query ${platform}` };
      }
      const analysis = analyzeBrandPresence(response, brandName, website);
      return { platform, response, ...analysis };
    });

    return new Response(JSON.stringify({ brandName, prompt, results, remaining }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("llm-prompt-tester error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
