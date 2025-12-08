"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CustomersTableRow } from "@/types/CustomersTableRow";
import type { SalesTableRow } from "@/types/SalesTableRow";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { createdAt } from "@/utils/createdAt";
import { shortId } from "@/utils/shortId";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
} from "@/utils/orderStatus";

import { DataTable, type Column } from "@/app/components/Table";
import Card from "@/app/components/Card";
import TablePagination from "@/app/components/TablePagination";

type Props = {
  orders: SalesTableRow[];
  customers: CustomersTableRow[];
};

type TabKey = "sales" | "customers" | "total";

const activeClass = "text-blue-500 border-b-2";
const inactiveClass =
  "text-neutral-500 hover:bg-neutral-50 hover:cursor-pointer";

const PER_PAGE = 15;

export default function UserDetailsTabs({ orders, customers }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const initialTab: TabKey =
    tabParam === "customers" || tabParam === "total" ? tabParam : "sales";
  const [activeTab, setActiveTab] = React.useState<TabKey>(initialTab);

  React.useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "customers" || tab === "total") {
      setActiveTab(tab);
    } else {
      setActiveTab("sales");
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const salesTotal = orders.length;
  const salesTotalPages = Math.max(1, Math.ceil(salesTotal / PER_PAGE));
  const salesPage = Math.min(currentPage, salesTotalPages);
  const salesStart = (salesPage - 1) * PER_PAGE;
  const pageSales = orders.slice(salesStart, salesStart + PER_PAGE);

  const customersTotal = customers.length;
  const customersTotalPages = Math.max(1, Math.ceil(customersTotal / PER_PAGE));
  const customersPage = Math.min(currentPage, customersTotalPages);
  const customersStart = (customersPage - 1) * PER_PAGE;
  const pageCustomers = customers.slice(
    customersStart,
    customersStart + PER_PAGE,
  );

  const totalSales = React.useMemo(
    () => orders.reduce((acc, o) => acc + Number(o.total_price || 0), 0),
    [orders],
  );

  const salesColumns: Column<SalesTableRow>[] = [
    {
      header: "Pedido",

      width: 140,
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
      cell: (value) => createdAt(String(value)),
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
      cell: (value) => createdAt(String(value)),
    },
  ];

  const customersCount = customers.length;

  return (
    <section className="space-y-4">
      <div className="flex gap-2 border-b border-neutral-200 text-sm">
        <button
          type="button"
          onClick={() => handleTabChange("sales")}
          className={[
            "px-4 py-2",
            activeTab === "sales" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Vendas
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("customers")}
          className={[
            "px-4 py-2",
            activeTab === "customers" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Clientes cadastrados
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("total")}
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
              data={pageSales}
              rowKey={(r) => r.id}
              emptyMessage="Nenhuma venda encontrada para este usuário."
              zebra
              stickyHeader
            />

            <TablePagination
              totalItems={salesTotal}
              perPage={PER_PAGE}
              currentPage={salesPage}
              basePath={pathname}
              searchParams={{ tab: "sales" }}
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
              data={pageCustomers}
              rowKey={(r) => r.id}
              emptyMessage="Nenhum cliente cadastrado por este usuário."
              zebra
              stickyHeader
            />

            <TablePagination
              totalItems={customersTotal}
              perPage={PER_PAGE}
              currentPage={customersPage}
              basePath={pathname}
              searchParams={{ tab: "customers" }}
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
