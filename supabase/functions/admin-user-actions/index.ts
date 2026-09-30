import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const respond = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond(405, { error: "Use POST." });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return respond(500, { error: "Server configuration is missing." });

    const token = request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return respond(401, { error: "Please sign in." });

    // The service credential stays here, never in Vite or a browser bundle.
    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user: caller }, error: authError } = await admin.auth.getUser(token);
    if (authError || !caller) return respond(401, { error: "Your session is invalid. Please sign in again." });

    const { data: callerProfile, error: callerError } = await admin.from("user_profiles")
      .select("role, is_active").eq("id", caller.id).single();
    if (callerError || callerProfile?.role !== "admin" || !callerProfile.is_active) {
      return respond(403, { error: "An active administrator account is required." });
    }

    let body;
    try { body = await request.json(); } catch { return respond(400, { error: "Invalid JSON." }); }
    if (!body || !["edit", "delete"].includes(body.action) || typeof body.userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.userId)) {
      return respond(400, { error: "Provide an edit/delete action and a valid userId." });
    }

    const { data: target, error: targetError } = await admin.from("user_profiles")
      .select("id, role").eq("id", body.userId).maybeSingle();
    if (targetError) return respond(500, { error: "Could not load the target account." });
    if (!target) return respond(404, { error: "User not found. Refresh the list." });

    if (body.action === "delete") {
      if (body.userId === caller.id || target.role === "admin") {
        return respond(403, { error: "Administrator accounts cannot be deleted here." });
      }
      const { error } = await admin.auth.admin.deleteUser(body.userId);
      if (error) {
        console.error("Auth deletion failed", error.code, error.message);
        return respond(409, { error: "Deletion failed. Check the cascade migration and any Supabase Storage objects owned by this user. No manual row cleanup was performed." });
      }
      return respond(200, { success: true });
    }

    const updates = body.updates;
    if (!updates || typeof updates.first_name !== "string" || updates.first_name.length > 80 ||
      typeof updates.last_name !== "string" || updates.last_name.length > 80 ||
      typeof updates.phone !== "string" || updates.phone.length > 30 ||
      typeof updates.is_active !== "boolean") {
      return respond(400, { error: "Invalid profile fields." });
    }
    if (target.role === "admin" && !updates.is_active) {
      return respond(403, { error: "Administrator accounts cannot be deactivated here." });
    }
    // Explicit allowlist: the request cannot change id, email or role.
    const { data: user, error } = await admin.from("user_profiles").update({
      first_name: updates.first_name.trim(), last_name: updates.last_name.trim(),
      phone: updates.phone.trim(), is_active: updates.is_active,
    }).eq("id", body.userId).select().single();
    if (error) return respond(500, { error: "Could not update the user." });
    return respond(200, { success: true, user });
  } catch (error) {
    console.error("admin-user-actions failed", error);
    return respond(500, { error: "Unexpected server error. Please try again." });
  }
});
