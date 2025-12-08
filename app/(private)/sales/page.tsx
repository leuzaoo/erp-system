import {
  ArrowDown01Icon,
  ArrowDown10Icon,
  ArrowDownAZIcon,
  ArrowDownUpIcon,
  ArrowDownZAIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";

import type { SalesTableRow } from "@/types/SalesTableRow";
import type { SearchParams } from "@/types/SearchParams";
import type { SortField } from "@/types/SortField";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { requireRole } from "@/utils/auth/requireRole";
import { canEditOrder } from "@/utils/permissions";
import { supabaseRSC } from "@/utils/supabase/rsc";
import { createdAt } from "@/utils/createdAt";
import { shortId } from "@/utils/shortId";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
} from "@/utils/orderStatus";

import { DataTable, type Column } from "@/app/components/Table";
import TablePagination from "@/app/components/TablePagination";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

const PER_PAGE = 15;

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    q: qParam = "",
    sort: sortParam,
    dir: dirParam,
    page: pageParam,
  } = await searchParams;
  const rawQ = qParam.trim();

  const sortField: SortField | undefined =
    sortParam === "status" || sortParam === "created_at"
      ? sortParam
      : undefined;

  const sortDir: "asc" | "desc" =
    dirParam === "desc" || dirParam === "asc" ? dirParam : "asc";

  const { user, role } = await requireRole(["admin", "vendedor"]);
  const supabase = await supabaseRSC();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot, customer_id, seller_id, total_price, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <pre className="text-red-400">Erro: {error.message}</pre>;
  }

  const normalize = (value: string | null | undefined): string =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  let filtered = orders ?? [];

  if (rawQ) {
    const q = normalize(rawQ.replace(/^#/, ""));

    filtered = filtered.filter((o) => {
      const customer = normalize(o.customer_name_snapshot);
      const seller = normalize(o.seller_name_snapshot);
      const number = normalize(o.number);
      const idFull = normalize(o.id);
      const idShort = normalize(o.id.slice(0, 5));

      return (
        customer.includes(q) ||
        seller.includes(q) ||
        number.includes(q) ||
        idShort.includes(q) ||
        idFull.includes(q)
      );
    });
  }

  if (sortField === "status") {
    filtered = [...filtered].sort((a, b) => {
      const sa = String(a.status ?? "");
      const sb = String(b.status ?? "");
      const base = sa.localeCompare(sb, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });
      return sortDir === "asc" ? base : -base;
    });
  } else if (sortField === "created_at") {
    filtered = [...filtered].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      const base = da - db;
      return sortDir === "asc" ? base : -base;
    });
  }

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageOrders = filtered.slice(start, start + PER_PAGE);

  const buildSortHref = (field: SortField) => {
    const isCurrent = sortField === field;
    const nextDir: "asc" | "desc" = !isCurrent
      ? "asc"
      : sortDir === "asc"
        ? "desc"
        : "asc";

    const params = new URLSearchParams();
    if (rawQ) params.set("q", rawQ);
    params.set("sort", field);
    params.set("dir", nextDir);

    return `/sales?${params.toString()}`;
  };

  const isStatusSorted = sortField === "status";
  const isCreatedSorted = sortField === "created_at";

  const columns: Column<SalesTableRow>[] = [
    {
      header: "Pedido",
      cell: (value, row) => (
        <Link
          href={`/orders/${row.id}`}
          className="font-bold uppercase hover:underline"
        >
          {shortId(row.id)}
        </Link>
      ),
      width: 140,
    },
    {
      header: "Cliente",
      accessorKey: "customer_name_snapshot",
      cell: (value) => (value ?? "—") as string,
    },
    {
      header: "Vendedor",
      accessorKey: "seller_name_snapshot",
      cell: (value) => (value ?? "—") as string,
    },
    {
      header: (
        <Link
          href={buildSortHref("status")}
          className="hover:bg-pattern-100 flex max-w-max items-center gap-1 rounded-md px-2"
        >
          <span className="flex items-center gap-1">
            <span>Status</span>
            {!isStatusSorted ? (
              <ArrowDownUpIcon size={16} />
            ) : sortDir === "asc" ? (
              <ArrowDownAZIcon size={16} />
            ) : (
              <ArrowDownZAIcon size={16} />
            )}
          </span>
        </Link>
      ),
      accessorKey: "status",
      width: 140,
      cell: (value) => {
        const status = String(value ?? "");

        return (
          <span
            className={
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
              (ORDER_STATUS_BADGE_CLASS[status] ?? "border border-neutral-700")
            }
          >
            {ORDER_STATUS_LABELS[status] ?? status}
          </span>
        );
      },
    },

    {
      header: "Valor",
      accessorKey: "total_price",
      align: "right",
      width: 140,
      cell: (value) => (
        <span className="font-semibold">
          {brazilianCurrency(value as number | string)}
        </span>
      ),
    },
    {
      header: (
        <Link
          href={buildSortHref("created_at")}
          className="hover:bg-pattern-100 ml-auto flex max-w-max items-center gap-1 rounded-md px-2"
        >
          <span className="flex items-center gap-1">
            <span>Criado</span>
            {!isCreatedSorted ? (
              <ArrowDownUpIcon size={16} />
            ) : sortDir === "asc" ? (
              <ArrowDown01Icon size={16} />
            ) : (
              <ArrowDown10Icon size={16} />
            )}
          </span>
        </Link>
      ),
      accessorKey: "created_at",
      align: "right",
      width: 170,
      cell: (value, row) => createdAt(row.created_at),
    },
  ];

  const columnsWithEdit: Column<SalesTableRow>[] = [
    ...columns,
    {
      header: "",
      align: "right",
      width: 80,
      cell: (_, row) => {
        const allowed = canEditOrder({
          role,
          userId: user.id,
          sellerId: row.seller_id ?? null,
        });

        if (!allowed) return null;

        return (
          <Link
            href={`/orders/${row.id}/edit`}
            className="rounded-md border border-neutral-400 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200"
          >
            Editar
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <Link
          href="/sales/new-sale"
          className="text-lighter flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
        >
          <PlusIcon size={20} /> Nova venda
        </Link>
      </div>

      <form className="flex max-w-lg gap-2" action="/sales" method="get">
        <Input
          name="q"
          type="text"
          placeholder="Busque por cliente, nº de venda ou código…"
          defaultValue={rawQ}
        />
        <Button
          type="submit"
          className="bg-darker! hover:bg-pattern-700! border-pattern-400! text-lighter! flex items-center gap-2 border"
        >
          <SearchIcon size={16} />
          Pesquisar
        </Button>
      </form>

      <DataTable<SalesTableRow>
        columns={columnsWithEdit}
        data={pageOrders}
        rowKey={(r) => r.id}
        caption={
          rawQ ? (
            <>
              Resultados para: “<span className="font-bold">{rawQ}</span>”.
            </>
          ) : undefined
        }
        emptyMessage="Nenhuma venda encontrada."
        zebra
        stickyHeader
      />

      <TablePagination
        totalItems={totalItems}
        perPage={PER_PAGE}
        currentPage={safePage}
        basePath="/sales"
        searchParams={{
          q: rawQ || undefined,
          sort: sortField,
          dir: sortField ? sortDir : undefined,
        }}
      />
    </div>
  );
}
