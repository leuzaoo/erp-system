"use server";

import { revalidatePath } from "next/cache";

import type { AppRole } from "@/utils/permissions";

import { requireRole } from "@/utils/auth/requireRole";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { supabaseRSC } from "@/utils/supabase/rsc";

type CreateUserPayload = {
  name: string;
  email: string;
  role: AppRole;
  password: string;
};

type UpdateUserPayload = {
  name: string;
  email: string;
  role: AppRole;
};

export async function createUserAction(
  payload: CreateUserPayload,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole(["admin"]);

  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();
  const role = payload.role;
  const password = payload.password.trim();

  if (!name || !email || !password) {
    return { ok: false, message: "Preencha nome, e-mail e senha." };
  }

  if (password.length < 6) {
    return {
      ok: false,
      message: "A senha deve ter pelo menos 6 caracteres.",
    };
  }

  const adminClient = supabaseAdmin();

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData?.user) {
    return {
      ok: false,
      message: authError?.message ?? "Erro ao criar usuário de autenticação.",
    };
  }

  const authUser = authData.user;

  const supabase = await supabaseRSC();

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.id,
    name,
    email,
    role,
    user_status: "ativo",
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authUser.id).catch(() => {});
    return {
      ok: false,
      message: `Erro ao criar perfil: ${profileError.message}`,
    };
  }

  revalidatePath("/users");

  return { ok: true };
}

export async function updateUserAction(
  userId: string,
  payload: UpdateUserPayload,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole(["admin"]);

  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();
  const role = payload.role;

  if (!name || !email || !role) {
    return { ok: false, message: "Preencha nome, e-mail e função." };
  }

  const adminClient = supabaseAdmin();
  const supabase = await supabaseRSC();

  const { error: authError } = await adminClient.auth.admin.updateUserById(
    userId,
    {
      email,
    },
  );

  if (authError) {
    return {
      ok: false,
      message: authError.message ?? "Erro ao atualizar usuário de login.",
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name,
      email,
      role,
    })
    .eq("id", userId);

  if (profileError) {
    return {
      ok: false,
      message: profileError.message ?? "Erro ao atualizar perfil.",
    };
  }

  revalidatePath("/users");

  return { ok: true };
}

export async function deleteUserAction(
  userId: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole(["admin"]);

  const adminClient = supabaseAdmin();
  const supabase = await supabaseRSC();

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    return {
      ok: false,
      message: profileError.message ?? "Erro ao remover perfil do usuário.",
    };
  }

  const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

  if (authError) {
    return {
      ok: false,
      message:
        authError.message ?? "Perfil removido, mas falhou ao remover login.",
    };
  }

  revalidatePath("/users");

  return { ok: true };
}
