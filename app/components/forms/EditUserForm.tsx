"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { updateUserAction, deleteUserAction } from "@/app/actions/user-actions";

import type { AppRole } from "@/utils/permissions";
import type { UserRow } from "@/types/UserRow";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { toast } from "sonner";

interface EditUserFormProps {
  user: UserRow;
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const role = String(form.get("role") || "").trim() as AppRole;

    const passwordRaw = String(form.get("password") || "").trim();
    const status = String(form.get("user_status") || "ativo") as
      | "ativo"
      | "inativo";

    if (!name || !email || !role) {
      setError("Preencha nome, e-mail e função.");
      return;
    }

    const payload: {
      name: string;
      email: string;
      role: AppRole;
      password?: string;
      user_status: "ativo" | "inativo";
    } = { name, email, role, user_status: status };

    if (passwordRaw) payload.password = passwordRaw;

    setSubmitting(true);
    const toastId = toast.loading("Atualizando informações do usuário...");
    const res = await updateUserAction(user.id, payload);
    setSubmitting(false);

    if (!res.ok) {
      const message = res.message ?? "Erro ao atualizar usuário.";
      setError(message);
      toast.error(message, { id: toastId });
      return;
    }

    router.push("/users");
    router.refresh();
    toast.success("Usuário atualizado com sucesso.", { id: toastId });
  }

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`))
      return;

    setDeleting(true);
    setError(null);

    const res = await deleteUserAction(user.id);
    setDeleting(false);

    if (!res.ok) {
      setError(res.message ?? "Erro ao remover usuário.");
      return;
    }

    router.push("/users");
    router.refresh();
    toast.success("Usuário excluído com sucesso.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-3 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <Input
        name="name"
        label="Nome completo*"
        defaultValue={user.name}
        required
      />

      <Input
        name="email"
        label="E-mail*"
        type="email"
        defaultValue={user.email}
        required
      />

      <Input
        name="password"
        label="Nova senha (opcional)"
        type="password"
        autoComplete="new-password"
        placeholder="Preencha apenas se quiser redefinir"
      />

      <div>
        <label className="mb-1 block text-sm font-semibold">Função*</label>
        <select
          name="role"
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          defaultValue={user.role}
        >
          <option value="admin">Admin</option>
          <option value="vendedor">Vendedor</option>
          <option value="fabrica">Fábrica</option>
        </select>
      </div>

      <div className="max-w-max">
        <label className="mb-1 block text-sm font-semibold">
          Status do usuário*
        </label>
        <select
          name="user_status"
          defaultValue={user.user_status ?? "ativo"}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || submitting}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-red-300 p-2 text-sm text-red-600 hover:bg-red-100 hover:text-red-700"
        >
          {deleting ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2Icon size={16} />
          )}
          Remover usuário
        </button>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/users/${user.id}`)}
            disabled={submitting || deleting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={submitting || deleting}
            className="flex w-20 justify-center hover:bg-blue-600"
          >
            {submitting ? (
              <Loader2Icon size={16} className="animate-spin" />
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
