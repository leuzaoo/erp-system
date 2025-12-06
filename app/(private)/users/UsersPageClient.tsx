"use client";

import {
  ArrowDownAZIcon,
  ArrowDownUpIcon,
  ArrowDownZAIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import Link from "next/link";

import type { UserRow } from "@/types/UserRow";

import { createdAt } from "@/utils/createdAt";
import { shortId } from "@/utils/shortId";

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showNewUser, setShowNewUser] = React.useState(false);
  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");

  type UserSortField = "name" | "user_status" | "role";

  const sortParam = searchParams.get("sort");
  const dirParam = searchParams.get("dir");

  const sortField: UserSortField =
    sortParam === "name" || sortParam === "user_status" || sortParam === "role"
      ? sortParam
      : "name";
  const sortDir: "asc" | "desc" =
    dirParam === "desc" || dirParam === "asc" ? dirParam : "asc";

  const toggleNewUser = () => setShowNewUser((v) => !v);

  const normalize = (value: string | null | undefined): string =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const handleSort = (field: UserSortField) => {
    const isCurrent = sortField === field;
    const nextDir: "asc" | "desc" = !isCurrent
      ? "asc"
      : sortDir === "asc"
        ? "desc"
        : "asc";

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", field);
    params.set("dir", nextDir);

    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderSortIcon = (
    field: UserSortField,
    ascIcon: React.ReactNode,
    descIcon: React.ReactNode,
  ) => {
    if (sortField !== field) {
      return <ArrowDownUpIcon size={16} />;
    }
    return sortDir === "asc" ? ascIcon : descIcon;
  };

  const filteredUsers = React.useMemo(() => {
    const term = query.trim();
    let list = [...users];

    if (term) {
      const q = normalize(term);

      list = list.filter((u) => {
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
    }

    const factor = sortDir === "asc" ? 1 : -1;

    list.sort((a, b) => {
      if (sortField === "name") {
        return (
          a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }) *
          factor
        );
      }

      if (sortField === "user_status") {
        const sa = normalize(String(a.user_status ?? ""));
        const sb = normalize(String(b.user_status ?? ""));
        return sa.localeCompare(sb, "pt-BR", { sensitivity: "base" }) * factor;
      }

      if (sortField === "role") {
        const ra = normalize(String(a.role ?? ""));
        const rb = normalize(String(b.role ?? ""));
        return ra.localeCompare(rb, "pt-BR", { sensitivity: "base" }) * factor;
      }

      return 0;
    });

    return list;
  }, [users, query, sortField, sortDir]);

  const roleLabel: Record<UserRow["role"], string> = {
    admin: "Admin",
    vendedor: "Vendedor",
    fabrica: "Fábrica",
  };

  const columns: Column<UserRow>[] = [
    {
      header: (
        <button
          type="button"
          onClick={() => handleSort("name")}
          className="hover:bg-pattern-100 flex cursor-pointer items-center gap-1 rounded-md px-1"
        >
          <span>Nome completo</span>
          <span>
            {renderSortIcon(
              "name",
              <ArrowDownAZIcon size={16} />,
              <ArrowDownZAIcon size={16} />,
            )}
          </span>
        </button>
      ),
      accessorKey: "name",
      cell: (value, row) => (
        <div className="flex flex-col">
          <Link
            href={`/users/${row.id}`}
            className="font-semibold text-neutral-900 hover:underline"
          >
            {String(value)}
          </Link>
          <span className="text-xs text-neutral-500">{shortId(row.id)}</span>
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
      header: (
        <button
          type="button"
          onClick={() => handleSort("user_status")}
          className="hover:bg-pattern-100 flex cursor-pointer items-center gap-1 rounded-md px-1"
        >
          <span>Status</span>
          <span>
            {renderSortIcon(
              "user_status",
              <ArrowDownAZIcon size={16} />,
              <ArrowDownZAIcon size={16} />,
            )}
          </span>
        </button>
      ),
      accessorKey: "user_status",
      width: 140,
      cell: (value) => {
        const status = String(value ?? "ativo");
        const isActive = status === "ativo";

        return (
          <span
            className={[
              "hover:bg-pattern-100 inline-flex cursor-pointer items-center gap-1 rounded-full rounded-md px-1 px-2 py-0.5 text-xs font-medium",
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
            {isActive ? "Ativo" : "Inativo"}
          </span>
        );
      },
    },
    {
      header: (
        <button
          type="button"
          onClick={() => handleSort("role")}
          className="hover:bg-pattern-100 flex cursor-pointer items-center gap-1 rounded-md px-1"
        >
          <span>Função</span>
          <span>
            {renderSortIcon(
              "role",
              <ArrowDownAZIcon size={16} />,
              <ArrowDownZAIcon size={16} />,
            )}
          </span>
        </button>
      ),
      accessorKey: "role",
      width: 160,
      cell: (value) => {
        const role = value as UserRow["role"];
        return (
          <span className="border-pattern-200 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-neutral-700">
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
      cell: (value) => createdAt(String(value)),
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
