"use client";

import * as React from "react";
import Link from "next/link";
import moment from "moment";

import type { CustomersTableRow } from "@/types/CustomersTableRow";
import type { SalesTableRow } from "@/types/SalesTableRow";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
} from "@/utils/orderStatus";

import { DataTable, type Column } from "@/app/components/Table";
import Card from "@/app/components/Card";

type Props = {
  orders: SalesTableRow[];
  customers: CustomersTableRow[];
};

type TabKey = "sales" | "customers" | "total";

const activeClass = "text-blue-500 border-b-2";
const inactiveClass =
  "text-neutral-500 hover:bg-neutral-50 hover:cursor-pointer";

export default function UserDetailsTabs({ orders, customers }: Props) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("sales");

  const totalSales = React.useMemo(
    () => orders.reduce((acc, o) => acc + Number(o.total_price || 0), 0),
    [orders],
  );

  const salesColumns: Column<SalesTableRow>[] = [
    {
      header: "Pedido",
      accessorFn: (r) => r.id.slice(0, 5),
      width: 140,
      cell: (value, row) => (
        <Link
          href={`/orders/${row.id}`}
          className="font-bold uppercase hover:underline"
        >
          #{String(value)}
        </Link>
      ),
    },
    {
      header: "Cliente",
      accessorKey: "customer_name_snapshot",
      cell: (value) => (value ?? "—") as string,
    },
    {
      header: "Status",
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
      header: "Criado em",
      accessorKey: "created_at",
      align: "right",
      width: 190,
      cell: (value) => moment(String(value)).format("DD/MM/YYYY - HH:mm"),
    },
  ];

  const customerColumns: Column<CustomersTableRow>[] = [
    {
      header: "Nome",
      accessorKey: "name",
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
      width: 200,
      cell: (value) => (value ?? "—") as string,
    },
    {
      header: "Cadastrado em",
      accessorKey: "created_at",
      align: "right",
      width: 190,
      cell: (value) => moment(String(value)).format("DD/MM/YYYY"),
    },
  ];

  const customersCount = customers.length;

  return (
    <section className="space-y-4">
      <div className="flex gap-2 border-b border-neutral-200 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("sales")}
          className={[
            "px-4 py-2",
            activeTab === "sales" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Vendas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={[
            "px-4 py-2",
            activeTab === "customers" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Clientes cadastrados
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("total")}
          className={[
            "px-4 py-2",
            activeTab === "total" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Total em vendas
        </button>
      </div>

      <div>
        {activeTab === "sales" && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">
              Histórico de vendas realizadas por este usuário.
            </p>
            <DataTable<SalesTableRow>
              columns={salesColumns}
              data={orders}
              rowKey={(r) => r.id}
              emptyMessage="Nenhuma venda encontrada para este usuário."
              zebra
              stickyHeader
            />
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Card className="flex max-w-max flex-col gap-1">
                Clientes cadastrados por este usuário
                <span className="text-2xl font-bold">{customersCount}</span>
              </Card>
            </div>

            <DataTable<CustomersTableRow>
              columns={customerColumns}
              data={customers}
              rowKey={(r) => r.id}
              emptyMessage="Nenhum cliente cadastrado por este usuário."
              zebra
              stickyHeader
            />
          </div>
        )}

        {activeTab === "total" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="flex flex-col gap-1">
              <span className="text-sm text-neutral-500">
                Total em vendas (todos os pedidos deste usuário)
              </span>
              <span className="text-3xl font-bold">
                {brazilianCurrency(totalSales)}
              </span>
              <span className="text-xs text-neutral-500">
                {orders.length} pedidos registrados.
              </span>
            </Card>

            <Card className="flex flex-col gap-2 text-sm text-neutral-600">
              <span className="font-semibold">Resumo rápido</span>
              <span>
                • Este valor considera todos os pedidos associados a este
                vendedor.
              </span>
              <span>
                • Você pode usar os filtros da página de Vendas para análises
                mais detalhadas (por período, status etc.).
              </span>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
