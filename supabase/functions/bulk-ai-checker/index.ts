import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-key",
};

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !sigB64) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );

    const sigStr = atob(sigB64.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - sigB64.length % 4) % 4));
    const sig = new Uint8Array([...sigStr].map(c => c.charCodeAt(0)));
    const valid = await crypto.subtle.verify("HMAC", key, sig, enc.encode(`${headerB64}.${payloadB64}`));
    if (!valid) return false;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - payloadB64.length % 4) % 4)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

async function queryLovableModel(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a helpful AI assistant. Answer the user's question naturally and thoroughly. If you know of specific brands, companies, products, or services relevant to the question, mention them by name. Provide honest, detailed recommendations." },
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
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Claude returned ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

function analyzeBrandPresence(response: string, brandName: string): {
  status: "cited" | "recommended" | "mentioned" | "absent";
  snippets: string[];
} {
  const lower = response.toLowerCase();
  const brandLower = brandName.toLowerCase();

  if (!lower.includes(brandLower)) return { status: "absent", snippets: [] };

  const sentences = response.split(/[.!?]+/).filter(s => s.toLowerCase().includes(brandLower));
  const snippets = sentences.slice(0, 3).map(s => s.trim()).filter(Boolean);

  const idx = lower.indexOf(brandLower);
  const window = lower.slice(Math.max(0, idx - 200), idx + brandLower.length + 200);

  const citeSignals = ["according to", "source", "cited", "reported", "published", "research by", "study by", "data from", "found that"];
  const recSignals = ["recommend", "suggest", "try", "consider", "best", "top", "leading", "great option", "good choice", "worth", "ideal", "excellent", "standout", "go with", "check out", "look into", "one of the"];

  if (citeSignals.some(s => window.includes(s))) return { status: "cited", snippets };
  if (recSignals.some(s => window.includes(s))) return { status: "recommended", snippets };
  return { status: "mentioned", snippets };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const token = req.headers.get("x-internal-key");
    const BULK_INTERNAL_KEY = Deno.env.get("BULK_INTERNAL_KEY");
    if (!token || !BULK_INTERNAL_KEY || !(await verifyToken(token, BULK_INTERNAL_KEY))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { brandName, prompt, models } = await req.json();

    if (!brandName || typeof brandName !== "string") {
      return new Response(JSON.stringify({ error: "Brand name required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!prompt || typeof prompt !== "string" || prompt.length > 1000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const CLAUDE_API_KEY = Deno.env.get("Claude");

    const selectedModels: string[] = models || ["gemini", "chatgpt", "claude"];
    const promises: Promise<{ platform: string; response: string }>[] = [];

    if (selectedModels.includes("gemini") && LOVABLE_API_KEY) {
      promises.push(
        queryLovableModel(LOVABLE_API_KEY, "google/gemini-3-flash-preview", prompt)
          .then(r => ({ platform: "Google Gemini", response: r }))
          .catch(() => ({ platform: "Google Gemini", response: "" }))
      );
    }

    if (selectedModels.includes("chatgpt") && LOVABLE_API_KEY) {
      promises.push(
        queryLovableModel(LOVABLE_API_KEY, "openai/gpt-5-mini", prompt)
          .then(r => ({ platform: "ChatGPT", response: r }))
          .catch(() => ({ platform: "ChatGPT", response: "" }))
      );
    }

    if (selectedModels.includes("claude") && CLAUDE_API_KEY) {
      promises.push(
        queryClaudeAPI(CLAUDE_API_KEY, prompt)
          .then(r => ({ platform: "Claude", response: r }))
          .catch(() => ({ platform: "Claude", response: "" }))
      );
    }

    const settled = await Promise.all(promises);

    const results = settled.map(({ platform, response }) => {
      if (!response) {
        return { platform, response: "", status: "error" as const, snippets: [], error: `Failed to query ${platform}` };
      }
      const analysis = analyzeBrandPresence(response, brandName);
      return { platform, response, ...analysis };
    });

    return new Response(JSON.stringify({ brandName, prompt, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("bulk-ai-checker error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
