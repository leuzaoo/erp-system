"use server";

import { supabaseAction } from "@/utils/supabase/action";
import { redirect } from "next/navigation";

export async function signInWithPassword(email: string, password: string) {
  const supabase = await supabaseAction();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  redirect("/");
}

export async function signOut() {
  const supabase = await supabaseAction();
  await supabase.auth.signOut();
  redirect("/login");
}
