import { supabase } from "@/lib/supabaseClient";

export async function getUserRole() {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data.role;
}
