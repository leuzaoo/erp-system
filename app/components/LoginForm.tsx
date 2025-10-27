"use client";

import { useState, FormEvent } from "react";
import { signIn } from "../actions/signin-action";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await signIn(email, password);
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        gap: 10,
        flexDirection: "column",
        maxWidth: 300,
      }}
    >
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
      <button type="submit">Entrar</button>
    </form>
  );
}
