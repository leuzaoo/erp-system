"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import Link from "next/link";
import moment from "moment";

import type { UserRow } from "@/types/UserRow";

import { DataTable, type Column } from "@/app/components/Table";
import NewUserForm from "@/app/components/forms/NewUserForm";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import Card from "@/app/components/Card";

type Props = {
  users: UserRow[];
};

export default function UsersPageClient({ users }: Props) {
  const router = useRouter();
  const [showNewUser, setShowNewUser] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const toggleNewUser = () => setShowNewUser((v) => !v);

  const normalize = (value: string | null | undefined): string =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredUsers = React.useMemo(() => {
    const term = query.trim();
    if (!term) return users;

    const q = normalize(term);

    return users.filter((u) => {
      const name = normalize(u.name);
      const email = normalize(u.email);
      const role = normalize(u.role);

      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        u.id.slice(0, 5).toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  const roleLabel: Record<UserRow["role"], string> = {
    admin: "Admin",
    vendedor: "Vendedor",
    fabrica: "Fábrica",
  };

  const columns: Column<UserRow>[] = [
    {
      header: "Nome completo",
      accessorKey: "name",
      cell: (value, row) => (
        <div className="flex flex-col">
          <Link
            href={`/users/${row.id}`}
            className="font-semibold text-neutral-900 hover:underline"
          >
            {String(value)}
          </Link>
          <span className="text-xs text-neutral-500">
            #{row.id.slice(0, 5).toUpperCase()}
          </span>
        </div>
      ),
      width: 280,
    },
    {
      header: "E-mail",
      accessorKey: "email",
      cell: (value) => (value ?? "—") as string,
      width: 260,
    },
    {
      header: "Status",
      accessorKey: "user_status",
      width: 140,
      cell: (value) => {
        const status = String(value ?? "ativo");
        const isActive = status === "ativo";

        return (
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isActive
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-neutral-300 bg-neutral-100 text-neutral-600",
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                isActive ? "bg-emerald-500" : "bg-neutral-400",
              ].join(" ")}
            />
            {isActive ? "Ativo" : status}
          </span>
        );
      },
    },
    {
      header: "Função",
      accessorKey: "role",
      width: 160,
      cell: (value) => {
        const role = value as UserRow["role"];
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
            {roleLabel[role] ?? role}
          </span>
        );
      },
    },
    {
      header: "Criado em",
      accessorKey: "created_at",
      align: "right",
      width: 200,
      cell: (value) => moment(String(value)).format("DD/MM/YYYY - HH:mm"),
    },
    {
      header: "",
      align: "right",
      width: 80,
      cell: (_, row) => (
        <Link
          href={`/users/${row.id}/edit`}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
        >
          Editar
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Usuários</h1>

        <div className="flex items-center gap-4">
          <Card className="flex max-w-max flex-col gap-1">
            Usuários cadastrados
            <span className="text-2xl font-bold">{users.length}</span>
          </Card>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex max-w-lg flex-1 items-center gap-2">
            <div className="relative w-full">
              <Input
                name="q"
                type="text"
                placeholder="Busque por nome, e-mail ou cargo…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500"
                onClick={() => setQuery("")}
                title="Limpar busca"
              >
                <SearchIcon size={16} />
              </button>
            </div>
          </div>

          <Button
            type="button"
            onClick={toggleNewUser}
            className="flex items-center gap-2 border border-blue-500"
          >
            <PlusIcon size={16} />
            Novo usuário
          </Button>
        </div>

        <DataTable<UserRow>
          columns={columns}
          data={filteredUsers}
          rowKey={(r) => r.id}
          caption={
            query ? (
              <>
                Resultados para: “<span className="font-bold">{query}</span>”.
              </>
            ) : undefined
          }
          emptyMessage="Nenhum usuário encontrado."
          zebra
          stickyHeader
        />
      </div>

      {showNewUser && (
        <NewUserForm
          closeModal={toggleNewUser}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
