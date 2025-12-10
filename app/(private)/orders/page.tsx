import {
  ArrowDown01Icon,
  ArrowDown10Icon,
  ArrowDownAZIcon,
  ArrowDownUpIcon,
  ArrowDownZAIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";

import type { SalesTableRow } from "@/types/SalesTableRow";
import type { SearchParams } from "@/types/SearchParams";
import type { SortField } from "@/types/SortField";

import { requireRole } from "@/utils/auth/requireRole";
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

export default async function OrdersPage({
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

  const { role } = await requireRole(["admin", "fabrica"]);
  const supabase = await supabaseRSC();

  let query = supabase
    .from("orders")
    .select(
      "id, number, seller_name_snapshot, seller_id, customer_id, customer_name_snapshot, total_price, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (role === "fabrica") {
    query = query.neq("status", "ENVIADO");
  }

  const { data: orders, error } = await query;

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
      const seller = normalize(o.seller_name_snapshot);
      const number = normalize(o.number);
      const idFull = normalize(o.id);
      const status = normalize(o.status);
      const idShort = normalize(o.id.slice(0, 5));

      return (
        seller.includes(q) ||
        number.includes(q) ||
        idShort.includes(q) ||
        status.includes(q) ||
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

    return `/orders?${params.toString()}`;
  };

  const isStatusSorted = sortField === "status";
  const isCreatedSorted = sortField === "created_at";

  const columns: Column<SalesTableRow>[] = [
    {
      header: "Pedido",
      accessorFn: (r) => r.id.slice(0, 5),
      cell: (value, row) => (
        <Link
          href={`/orders/${row.id}`}
          className="font-bold uppercase hover:underline"
        >
          {shortId(row.id)}
        </Link>
      ),
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
      align: "left",
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
      header: (
        <Link
          href={buildSortHref("created_at")}
          className="hover:bg-pattern-100 ml-auto flex max-w-max items-center gap-1 rounded-md px-2"
        >
          <span className="flex items-center gap-1">
            <span>Criado em</span>
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
      cell: (value, row) => createdAt(row.created_at),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">
          {role === "fabrica" ? "Pedidos para fabricação" : "Pedidos"}
        </h1>
      </div>

      <form className="flex max-w-lg gap-2" action="/orders" method="get">
        <Input
          name="q"
          type="text"
          placeholder="Busque por vendedor, nº do pedido ou código…"
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
        columns={columns}
        data={pageOrders}
        rowKey={(r) => r.id}
        caption={
          rawQ ? (
            <>
              Resultados para: “<span className="font-bold">{rawQ}</span>”.
            </>
          ) : role === "fabrica" ? (
            <p className="mb-2">
              Pedidos com <b>status</b> de <b>*Aprovado*</b> estão prontos para
              iniciar fabricação.
            </p>
          ) : undefined
        }
        emptyMessage="Nenhum pedido encontrado."
        zebra
        stickyHeader
      />

      <TablePagination
        totalItems={totalItems}
        perPage={PER_PAGE}
        currentPage={safePage}
        basePath="/orders"
        searchParams={{
          q: rawQ || undefined,
          sort: sortField,
          dir: sortField ? sortDir : undefined,
        }}
      />
    </div>
  );
}
