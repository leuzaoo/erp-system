"use server";
import { supabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithPassword(email: string, password: string) {
  const supabase = supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  redirect("/");
}

export async function signOut() {
  const supabase = supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
