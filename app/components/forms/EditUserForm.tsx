"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { updateUserAction, deleteUserAction } from "@/app/actions/user-actions";

import type { AppRole } from "@/utils/permissions";
import type { UserRow } from "@/types/UserRow";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

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

    if (!name || !email || !role) {
      setError("Preencha nome, e-mail e função do usuário.");
      return;
    }

    const payload: {
      name: string;
      email: string;
      role: AppRole;
      password?: string;
    } = { name, email, role };

    if (passwordRaw) {
      payload.password = passwordRaw;
    }

    setSubmitting(true);
    const res = await updateUserAction(user.id, payload);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.message ?? "Não foi possível atualizar o usuário.");
      return;
    }

    router.push("/users");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;

    setDeleting(true);
    setError(null);

    const res = await deleteUserAction(user.id);
    setDeleting(false);

    if (!res.ok) {
      setError(res.message ?? "Não foi possível remover o usuário.");
      return;
    }

    router.push("/users");
    router.refresh();
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
        defaultValue={user.email ?? ""}
        required
      />

      <Input
        name="password"
        label="Nova senha (opcional)"
        type="password"
        autoComplete="new-password"
        placeholder="Preencha apenas se quiser redefinir a senha"
      />

      <div>
        <label className="mb-1 block text-sm font-semibold">Função*</label>
        <select
          name="role"
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={user.role}
          required
        >
          <option value="admin">Admin</option>
          <option value="vendedor">Vendedor</option>
          <option value="fabrica">Fábrica</option>
        </select>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || submitting}
          className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-40"
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
            className="flex w-40 justify-center hover:bg-blue-600"
            disabled={submitting || deleting}
          >
            {submitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
