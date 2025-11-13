import { redirect } from "next/navigation";

import { supabaseRSC } from "../supabase/rsc";

export async function requireAuth() {
  const supabase = await supabaseRSC();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
