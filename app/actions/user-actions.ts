"use server";

import { revalidatePath } from "next/cache";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import type { AppRole } from "@/utils/permissions";

type CreateUserPayload = {
  name: string;
  email: string;
  role: AppRole;
  password: string;
};

type UpdateUserPayload = {
  name?: string;
  email?: string;
  role?: AppRole;
  password?: string;
  user_status?: "ativo" | "inativo";
};

export async function createUserAction(
  payload: CreateUserPayload,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole(["admin"]);

  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();
  const role = payload.role;
  const password = payload.password;

  if (!name || !email || !password) {
    return {
      ok: false,
      message: "Preencha nome, e-mail e senha do usuário.",
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
      message:
        authError?.message ?? "Erro ao criar usuário de autenticação (auth).",
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
    await adminClient.auth.admin.deleteUser(authUser.id);

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

  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const role = payload.role;
  const password = payload.password?.trim();
  const user_status = payload.user_status;

  const supabase = await supabaseRSC();
  const adminClient = supabaseAdmin();

  const authUpdate: { email?: string; password?: string } = {};
  if (email) authUpdate.email = email;
  if (password) authUpdate.password = password;

  if (Object.keys(authUpdate).length > 0) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      authUpdate,
    );

    if (authError) {
      return {
        ok: false,
        message: `Erro ao atualizar conta de login: ${authError.message}`,
      };
    }
  }

  const profileUpdate: Record<string, unknown> = {};
  if (name) profileUpdate.name = name;
  if (email) profileUpdate.email = email;
  if (role) profileUpdate.role = role;
  if (user_status) profileUpdate.user_status = user_status;

  if (Object.keys(profileUpdate).length > 0) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    if (profileError) {
      return {
        ok: false,
        message: `Erro ao atualizar perfil: ${profileError.message}`,
      };
    }
  }

  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);

  return { ok: true };
}

export async function deleteUserAction(
  userId: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole(["admin"]);

  const supabase = await supabaseRSC();
  const adminClient = supabaseAdmin();

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    return {
      ok: false,
      message: `Erro ao remover perfil: ${profileError.message}`,
    };
  }

  const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

  if (authError) {
    return {
      ok: false,
      message: `Perfil removido, mas houve erro ao apagar conta de login: ${authError.message}`,
    };
  }

  revalidatePath("/users");

  return { ok: true };
}
