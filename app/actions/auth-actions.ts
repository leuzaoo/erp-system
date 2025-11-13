"use server";

import { redirect } from "next/navigation";

import { supabaseAction } from "@/utils/supabase/action";

function translateError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Credenciais inválidas. Verifique seu email e senha.";
  }

  if (lower.includes("email not confirmed")) {
    return "Seu email ainda não foi confirmado. Verifique sua caixa de entrada.";
  }

  if (lower.includes("network error")) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  return "Erro ao fazer login. Tente novamente.";
}

export async function signIn(
  email: string,
  password: string,
  redirectTo?: string | null,
) {
  const supabase = await supabaseAction();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const translatedMessage = translateError(error.message);
    return { ok: false as const, message: translatedMessage };
  }

  redirect(redirectTo?.startsWith("/") ? redirectTo : "/dashboard");
}

export async function signOut() {
  const supabase = await supabaseAction();
  await supabase.auth.signOut();
  redirect("/login");
}
