import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function validateAdminAuth(authHeader: string) {
  if (!authHeader) {
    return { error: "Missing authorization header", status: 401 };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Strip Bearer
  const jwt = authHeader.replace("Bearer ", "").trim();

  // 🔑 Verify and get user (this is the login user)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(jwt);

  if (authError || !user) {
    console.error("❌ Invalid or expired JWT:", authError?.message);
    return { error: "Invalid authentication", status: 401 };
  }

  console.log("✅ Authenticated user:", user.email, user.id);

  // 🔍 Check admin role in custom table
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (
    adminError ||
    !adminUser ||
    !["master_admin", "admin"].includes(adminUser.role)
  ) {
    console.error(
      "❌ Admin authorization error:",
      adminError?.message || "Not an admin",
    );
    return { error: "Admin access required", status: 403 };
  }

  return {
    user, // 👈 this is the same user who logged in
    admin: adminUser,
  };
}
