import { notFound } from "next/navigation";

import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import type { UserRow } from "@/types/UserRow";

import EditUserForm from "@/app/components/forms/EditUserForm";

export default async function UserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);

  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <pre className="text-red-400">ID inválido.</pre>;
  }

  const supabase = await supabaseRSC();

  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, user_status, created_at")
    .eq("id", id)
    .single<UserRow>();

  if (error) {
    return (
      <pre className="text-red-600">
        Erro ao carregar os dados deste usuário: {error.message}
      </pre>
    );
  }

  if (!user) {
    notFound();
  }

  const shortId = user.id.slice(0, 5).toUpperCase();
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar usuário</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Atualize os dados de login deste usuário. A senha é opcional:
            preencha apenas se quiser redefini-la.
          </p>
        </div>

        <div className="text-right text-xs text-neutral-500">
          <p>
            ID do usuário:{" "}
            <span className="font-mono font-semibold">#{shortId}</span>
          </p>
          <p>Usuário criado em: {createdAt}</p>
        </div>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <EditUserForm user={user} />
      </section>
    </div>
  );
}
