import { redirect } from "next/navigation";
import { supabaseRSC } from "@/utils/supabase/rsc";

export async function requireAuth() {
  const supabase = await supabaseRSC();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
