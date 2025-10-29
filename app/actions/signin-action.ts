"use server";

import { supabaseServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(email: string, password: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error(error);
    return;
  }

  redirect("/dashboard");
}
