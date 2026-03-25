import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 10;
const WINDOW_MINUTES = 15;
const TOOL_NAME = "bulk-auth-attempts";

function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function createSignedToken(secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payload = btoa(JSON.stringify({
    sub: "bulk-tool",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60, // 4 hours
  })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${payload}`));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${header}.${payload}.${signature}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return new Response(
        JSON.stringify({ authenticated: false, error: "Password required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const BULK_TOOL_PASSWORD = Deno.env.get("BULK_TOOL_PASSWORD");
    const BULK_INTERNAL_KEY = Deno.env.get("BULK_INTERNAL_KEY");
    if (!BULK_TOOL_PASSWORD || !BULK_INTERNAL_KEY) {
      console.error("Required secrets not configured");
      return new Response(
        JSON.stringify({ authenticated: false, error: "Service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting: check attempts from this IP
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const clientIp = getClientIp(req);

    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count, error: countErr } = await supabase
      .from("tool_usage")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIp)
      .eq("tool_name", TOOL_NAME)
      .gte("created_at", windowStart);

    if (!countErr && (count || 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ authenticated: false, error: "Too many attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record this attempt
    await supabase.from("tool_usage").insert({ ip_address: clientIp, tool_name: TOOL_NAME });

    if (password === BULK_TOOL_PASSWORD) {
      // Issue a short-lived signed JWT instead of returning raw secret
      const token = await createSignedToken(BULK_INTERNAL_KEY);
      return new Response(
        JSON.stringify({ authenticated: true, token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Artificial delay on failed attempts to slow brute-force
    await new Promise(r => setTimeout(r, 500));

    return new Response(
      JSON.stringify({ authenticated: false, error: "Incorrect password" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("bulk-auth error:", e);
    return new Response(
      JSON.stringify({ authenticated: false, error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
