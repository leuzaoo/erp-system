"use client";

import { Loader2Icon, Trash2Icon, XIcon } from "lucide-react";
import * as React from "react";

import { updateUserAction, deleteUserAction } from "@/app/actions/user-actions";

import type { AppRole } from "@/utils/permissions";

import type { UserRow } from "@/types/UserRow";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

interface EditUserFormProps {
  user: UserRow;
  closeModal: () => void;
  onUpdated: () => void;
}

export default function EditUserForm({
  user,
  closeModal,
  onUpdated,
}: EditUserFormProps) {
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

    if (!name || !email || !role) {
      setError("Preencha nome, e-mail e função do usuário.");
      return;
    }

    setSubmitting(true);
    const res = await updateUserAction(user.id, { name, email, role });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.message ?? "Não foi possível atualizar o usuário.");
      return;
    }

    onUpdated();
    closeModal();
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

    onUpdated();
    closeModal();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-lighter text-darker w-full max-w-lg rounded-xl border p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Editar usuário</h2>
          <XIcon
            onClick={closeModal}
            className="cursor-pointer opacity-50 hover:opacity-100"
          />
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
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

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || submitting}
              className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-40"
            >
              <Trash2Icon size={16} />
              Remover usuário
            </button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={submitting || deleting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex w-32 justify-center hover:bg-blue-600"
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
      </div>
    </div>
  );
}
