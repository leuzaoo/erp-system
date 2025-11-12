"use client";
import { useState, FormEvent } from "react";
import { Loader2Icon } from "lucide-react";

import { signIn } from "@/app/actions/signin-action";

import TextField from "@/app/components/Input";
import Button from "@/app/components/Button";
import Card from "@/app/components/Card";

export default function LoginForm({
  redirectTo,
}: {
  redirectTo?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const result = await signIn(email, password, redirectTo);
    setLoading(false);

    if (result && !result.ok) {
      setErrorMessage(result.message ?? "Erro ao fazer login.");
    }
  }

  return (
    <Card className="mx-auto max-w-md text-center">
      <h1 className="text-lg font-bold">Sofa sellers</h1>
      <p className="text-pattern mb-6 text-sm">
        Faça login com as suas credenciais
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
        />
        <TextField
          label="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
        />

        {errorMessage && (
          <div className="my-2 flex items-center justify-center gap-2 rounded-md bg-red-50/60 py-2 text-sm text-red-600 ring-1 ring-red-100">
            {errorMessage}
          </div>
        )}

        <Button disabled={!email || !password} className="w-full" type="submit">
          {loading ? <Loader2Icon className="animate-spin" /> : "Entrar"}
        </Button>
      </form>
    </Card>
  );
}
