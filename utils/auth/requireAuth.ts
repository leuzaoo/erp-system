import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { supabaseRSC } from "@/utils/supabase/rsc";

export async function requireAuth(): Promise<User> {
  const supabase = await supabaseRSC();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}
