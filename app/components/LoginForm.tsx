"use client";
import { useState, FormEvent } from "react";
import { useFormStatus } from "react-dom";
import Card from "@/app/components/Card";
import TextField from "@/app/components/TextField";
import Button from "@/app/components/Button";

export default function LoginForm({
  action,
}: {
  action: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { pending } = useFormStatus?.() ?? { pending: false };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await action(email, password);
  }

  return (
    <Card className="mx-auto max-w-md text-center">
      <h1 className="text-lg font-bold">Sofa sellers</h1>
      <p className="mb-6 text-sm text-gray-500">
        Faça login com as suas credenciais
      </p>
      <form onSubmit={onSubmit}>
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
        <Button className="w-full" type="submit" disabled={pending}>
          Entrar
        </Button>
      </form>
    </Card>
  );
}
