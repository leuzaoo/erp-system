"use client";

import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import * as React from "react";

import { updateUserAction } from "@/app/actions/user-actions";
import type { UserRow } from "@/types/UserRow";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type Props = {
  user: UserRow;
};

export default function UserAccountEditForm({ user }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!name || !email) {
      setError("Preencha pelo menos o nome e o e-mail do usuário.");
      return;
    }

    setSubmitting(true);

    const res = await updateUserAction(user.id, {
      name,
      email,
      password: password || undefined,
      role: user.role,
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(res.message ?? "Não foi possível atualizar o usuário.");
      return;
    }
    router.push(`/users/${user.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-600 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <Input
        name="name"
        label="Nome completo*"
        defaultValue={user.name}
        autoFocus
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
        placeholder="Deixe em branco para manter a senha atual"
      />

      <div className="mt-5 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/users/${user.id}`)}
          disabled={submitting}
        >
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
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
