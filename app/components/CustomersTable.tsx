"use client";

import * as React from "react";
import Link from "next/link";
import moment from "moment";
import {
  ArrowDown01Icon,
  ArrowDown10Icon,
  ArrowDownAZIcon,
  ArrowDownUpIcon,
  ArrowDownZAIcon,
} from "lucide-react";

import type { CustomerListRow } from "@/types/CustomerListRow";

import {
  formatBrazilianDocument,
  stripNonDigits,
} from "@/utils/brazilianDocuments";

import { DataTable, type Column } from "@/app/components/Table";

export type CustomerSortField = "name" | "state" | "created_at";

type Props = {
  customers: CustomerListRow[];
  sortField: CustomerSortField;
  sortDir: "asc" | "desc";
  onSort: (field: CustomerSortField) => void;
  queryCaption?: React.ReactNode;
};

function renderSortIcon(
  isCurrent: boolean,
  sortDir: "asc" | "desc",
  ascIcon: React.ReactNode,
  descIcon: React.ReactNode,
) {
  if (!isCurrent) return <ArrowDownUpIcon size={16} />;
  return sortDir === "asc" ? ascIcon : descIcon;
}

export default function CustomersTable({
  customers,
  sortField,
  sortDir,
  onSort,
  queryCaption,
}: Props) {
  const columns: Column<CustomerListRow>[] = [
    {
      header: (
        <button
          type="button"
          onClick={() => onSort("name")}
          className="hover:bg-pattern-100 flex cursor-pointer items-center gap-1 rounded-md px-2"
        >
          <span>Nome</span>
          <span>
            {renderSortIcon(
              sortField === "name",
              sortDir,
              <ArrowDownAZIcon size={16} />,
              <ArrowDownZAIcon size={16} />,
            )}
          </span>
        </button>
      ),
      accessorKey: "name",
      width: 600,
      headerClassName: "select-none",
      cell: (value, row) => (
        <Link
          href={`/customers/${row.id}`}
          className="font-bold hover:underline"
        >
          {String(value)}
        </Link>
      ),
    },
    {
      header: "Documento",
      accessorKey: "document",
      align: "left",
      width: 200,
      cell: (value) => {
        const digits = stripNonDigits(String(value ?? ""));
        if (!digits) return "—";
        return formatBrazilianDocument(digits);
      },
    },
    {
      header: "CEP",
      accessorKey: "postal_code",
      width: 200,
      cell: (value) => (value ?? "-") as string,
    },
    {
      header: (
        <button
          type="button"
          onClick={() => onSort("state")}
          className="hover:bg-pattern-100 flex cursor-pointer items-center gap-1 rounded-md px-2"
        >
          <span>Estado</span>
          <span>
            {renderSortIcon(
              sortField === "state",
              sortDir,
              <ArrowDownAZIcon size={16} />,
              <ArrowDownZAIcon size={16} />,
            )}
          </span>
        </button>
      ),
      accessorKey: "state",
      align: "left",
      width: 200,
      headerClassName: "select-none",
      cell: (value) => (value ?? "-") as string,
    },
    {
      header: (
        <button
          type="button"
          onClick={() => onSort("created_at")}
          className="hover:bg-pattern-100 ml-auto flex cursor-pointer items-center gap-1 rounded-md px-2"
        >
          <span>Cadastrado em</span>
          <span>
            {renderSortIcon(
              sortField === "created_at",
              sortDir,
              <ArrowDown01Icon size={16} />,
              <ArrowDown10Icon size={16} />,
            )}
          </span>
        </button>
      ),
      accessorKey: "created_at",
      align: "right",
      width: 200,
      headerClassName: "select-none",
      cell: (value) => moment(String(value)).format("DD/MM/YYYY"),
    },
    {
      header: "",
      align: "right",
      width: 160,
      cell: (_, row) => (
        <div className="flex gap-1">
          <Link
            href={`/customers/${row.id}`}
            className="rounded-md border border-neutral-400 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200"
          >
            Ver
          </Link>
          <Link
            href={`/customers/${row.id}/edit`}
            className="rounded-md border border-neutral-400 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200"
          >
            Editar
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable<CustomerListRow>
      columns={columns}
      data={customers}
      rowKey={(r) => r.id}
      caption={queryCaption}
      emptyMessage="Nenhum cliente encontrado."
      zebra
      stickyHeader
    />
  );
}
