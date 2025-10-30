"use server";
import { supabaseAction } from "@/utils/supabase/action";
import { redirect } from "next/navigation";

export async function signIn(email: string, password: string) {
  const supabase = await supabaseAction();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  redirect("/dashboard");
}
