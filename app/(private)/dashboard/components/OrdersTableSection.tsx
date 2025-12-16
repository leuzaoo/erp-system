import Link from "next/link";
import {
  ArrowDown01Icon,
  ArrowDown10Icon,
  ArrowDownAZIcon,
  ArrowDownUpIcon,
  ArrowDownZAIcon,
} from "lucide-react";

import type { SortField } from "@/types/SortField";
import type { OrderRow } from "@/types/OrderRow";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { createdAt } from "@/utils/createdAt";
import { shortId } from "@/utils/shortId";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
} from "@/utils/orderStatus";

import { DataTable, type Column } from "@/app/components/Table";
import TablePagination from "@/app/components/TablePagination";

import { PER_PAGE } from "../lib/constants";

type SortOptions = {
  sortField?: SortField;
  sortDir: "asc" | "desc";
  rangeParam?: string;
  startParam?: string;
  endParam?: string;
};

function buildSortHref(field: SortField, options: SortOptions) {
  const { sortField, sortDir, rangeParam, startParam, endParam } = options;

  const isCurrent = sortField === field;
  const nextDir: "asc" | "desc" = !isCurrent
    ? "asc"
    : sortDir === "asc"
      ? "desc"
      : "asc";

  const params = new URLSearchParams();
  params.set("sort", field);
  params.set("dir", nextDir);

  if (rangeParam) params.set("range", rangeParam);
  if (startParam) params.set("start", startParam);
  if (endParam) params.set("end", endParam);

  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

type OrdersTableSectionProps = {
  orders: OrderRow[];
  totalItems: number;
  currentPage: number;
  sortField?: SortField;
  sortDir: "asc" | "desc";
  rangeParam?: string;
  startParam?: string;
  endParam?: string;
};

export default function OrdersTableSection({
  orders,
  totalItems,
  currentPage,
  sortField,
  sortDir,
  rangeParam,
  startParam,
  endParam,
}: OrdersTableSectionProps) {
  const isStatusSorted = sortField === "status";
  const isCreatedSorted = sortField === "created_at";

  const columns: Column<OrderRow>[] = [
    {
      header: "Pedido",
      cell: (_, row) => (
        <Link href={`/orders/${row.id}`} className="font-bold hover:underline">
          {shortId(row.id)}
        </Link>
      ),
    },
    {
      header: "Cliente",
      cell: (_, row) => <span>{row.customer_name_snapshot}</span>,
    },
    {
      header: "Vendedor",
      cell: (_, row) => <span>{row.seller_name_snapshot}</span>,
    },
    {
      header: (
        <Link
          href={buildSortHref("status", {
            sortField,
            sortDir,
            rangeParam,
            startParam,
            endParam,
          })}
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
      cell: (_, row) => (
        <span
          className={
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
            (ORDER_STATUS_BADGE_CLASS[row.status] ??
              "border border-neutral-700")
          }
        >
          {ORDER_STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
    {
      header: "Valor",
      align: "right",
      cell: (_, row) => brazilianCurrency(row.total_price),
    },
    {
      header: (
        <Link
          href={buildSortHref("created_at", {
            sortField,
            sortDir,
            rangeParam,
            startParam,
            endParam,
          })}
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
      align: "right",
      cell: (_, row) => createdAt(row.created_at),
    },
  ];

  return (
    <>
      <DataTable<OrderRow>
        data={orders}
        rowKey={(row) => row.id}
        emptyMessage="Nenhum pedido encontrado."
        columns={columns}
      />

      <TablePagination
        totalItems={totalItems}
        perPage={PER_PAGE}
        currentPage={currentPage}
        basePath="/dashboard"
        searchParams={{
          sort: sortField,
          dir: sortField ? sortDir : undefined,

          range: rangeParam,
          start: startParam,
          end: endParam,
        }}
      />
    </>
  );
}
