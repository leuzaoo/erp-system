"use server";

import { supabaseAction } from "@/utils/supabase/action";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await supabaseAction();
  await supabase.auth.signOut();
  redirect("/login");
}
