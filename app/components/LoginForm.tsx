"use client";
import { useState, FormEvent } from "react";
import { useFormStatus } from "react-dom";

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
    <form onSubmit={onSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Senha"
      />
      <button disabled={pending}>Entrar</button>
    </form>
  );
}
