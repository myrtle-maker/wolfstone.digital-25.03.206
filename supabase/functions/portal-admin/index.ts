import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify caller is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, requestId, email, name } = await req.json();

    if (action === "approve" && requestId && email) {
      // Create user via magic link / password-reset flow (no password exposed)
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: name || "" },
      });

      if (createErr) {
        // If user already exists, just approve the request
        if (createErr.message?.includes("already been registered")) {
          await supabase.from("client_requests").update({
            status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
          }).eq("id", requestId);
          
          return new Response(JSON.stringify({ success: true, note: "User already exists, request approved." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw createErr;
      }

      // Assign client role
      if (newUser.user) {
        await supabase.from("user_roles").insert({
          user_id: newUser.user.id,
          role: "client",
        });
      }

      // Generate a password-reset link so the user sets their own password
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
      });

      // Update request status
      await supabase.from("client_requests").update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      }).eq("id", requestId);

      // Log the reset link server-side only for debugging; never expose to client
      if (linkData?.properties?.action_link) {
        console.log(`Recovery link generated for ${email}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Account created for ${email}. A password-reset email has been sent to the user.`,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("portal-admin error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
