"use client";

import { Loader2Icon, XIcon } from "lucide-react";
import * as React from "react";

import { createUserAction } from "@/app/actions/user-actions";

import type { AppRole } from "@/utils/permissions";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { toast } from "sonner";

type Props = {
  closeModal: () => void;
  onSuccess?: () => void;
};

export default function NewUserForm({ closeModal, onSuccess }: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const role = String(form.get("role") || "vendedor") as AppRole;
    const password = String(form.get("password") || "").trim();
    const passwordConfirm = String(form.get("password_confirm") || "").trim();

    if (!name || !email || !password || !passwordConfirm) {
      setError("Por favor, preencha nome, e-mail e senha.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("As senhas não conferem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    const res = await createUserAction({ name, email, role, password });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.message ?? "Não foi possível criar o usuário.");
      return;
    }

    onSuccess?.();
    closeModal();
    toast.success("Usuário criado com sucesso.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-lighter text-darker w-full max-w-lg rounded-xl border p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Novo usuário</h2>
          <XIcon
            onClick={closeModal}
            className="cursor-pointer opacity-50 hover:opacity-100"
          />
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-600 bg-red-100 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="name" label="Nome completo*" required autoFocus />
          <Input name="email" label="E-mail*" type="email" required />

          <div className="grid grid-cols-2 gap-3">
            <Input name="password" label="Senha*" type="password" required />
            <Input
              name="password_confirm"
              label="Confirmar senha*"
              type="password"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-neutral-800">
              Função*
            </label>
            <select
              name="role"
              defaultValue="vendedor"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="vendedor">Vendedor</option>
              <option value="fabrica">Fábrica</option>
            </select>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex w-40 justify-center hover:bg-blue-600"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Salvar usuário"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
