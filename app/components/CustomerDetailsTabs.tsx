"use client";

import {
  ArrowDown01Icon,
  ArrowDown10Icon,
  ArrowDownUpIcon,
} from "lucide-react";
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
import Button from "@/app/components/Button";
import Card from "@/app/components/Card";
import TablePagination from "@/app/components/TablePagination";

type Props = {
  customer: CustomersTableRow;
  orders: SalesTableRow[];
};

type TabKey = "info" | "orders";

const activeClass = "border-b-2 border-blue-500 text-blue-500 font-medium";
const inactiveClass = "text-neutral-500  hover:text-neutral-700 cursor-pointer";

const PER_PAGE = 15;

export default function CustomerDetailsTabs({ customer, orders }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const initialTab: TabKey = tabParam === "orders" ? "orders" : "info";
  const [activeTab, setActiveTab] = React.useState<TabKey>(initialTab);

  React.useEffect(() => {
    setActiveTab(searchParams.get("tab") === "orders" ? "orders" : "info");
  }, [searchParams]);

  const sortParam = searchParams.get("sort");
  const dirParam = searchParams.get("dir");
  const pageParam = searchParams.get("page");

  const sortField: "created_at" | "total_price" =
    sortParam === "total_price" ? "total_price" : "created_at";
  const sortDir: "asc" | "desc" =
    dirParam === "desc" || dirParam === "asc" ? dirParam : "asc";

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("page");
    params.delete("sort");
    params.delete("dir");

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleSort = (field: "created_at" | "total_price") => {
    const isCurrent = sortField === field;
    const nextDir: "asc" | "desc" = !isCurrent
      ? "asc"
      : sortDir === "asc"
        ? "desc"
        : "asc";

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "orders");
    params.set("sort", field);
    params.set("dir", nextDir);
    params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const renderSortIcon = (
    field: "created_at" | "total_price",
    ascIcon: React.ReactNode,
    descIcon: React.ReactNode,
  ) => {
    if (sortField !== field) {
      return <ArrowDownUpIcon size={16} />;
    }
    return sortDir === "asc" ? ascIcon : descIcon;
  };

  const sortedOrders = React.useMemo(() => {
    const factor = sortDir === "asc" ? 1 : -1;
    const list = [...orders];

    list.sort((a, b) => {
      if (sortField === "created_at") {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return (da - db) * factor;
      }

      if (sortField === "total_price") {
        const ta = Number(a.total_price ?? 0);
        const tb = Number(b.total_price ?? 0);
        return (ta - tb) * factor;
      }

      return 0;
    });

    return list;
  }, [orders, sortDir, sortField]);

  const totalItems = sortedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageOrders = sortedOrders.slice(start, start + PER_PAGE);

  const ordersColumns: Column<SalesTableRow>[] = [
    {
      header: "Pedido",
      width: 140,
      cell: (_, row) => (
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
      header: (
        <button
          type="button"
          onClick={() => handleSort("total_price")}
          className="hover:bg-pattern-100 ml-auto flex cursor-pointer items-center gap-1 rounded-md px-1"
        >
          <span>Valor</span>
          <span>
            {renderSortIcon(
              "total_price",
              <ArrowDown01Icon size={16} />,
              <ArrowDown10Icon size={16} />,
            )}
          </span>
        </button>
      ),
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
        <button
          type="button"
          onClick={() => handleSort("created_at")}
          className="hover:bg-pattern-100 ml-auto flex cursor-pointer items-center gap-1 rounded-md px-1"
        >
          <span>Criado em</span>
          <span>
            {renderSortIcon(
              "created_at",
              <ArrowDown01Icon size={16} />,
              <ArrowDown10Icon size={16} />,
            )}
          </span>
        </button>
      ),
      accessorKey: "created_at",
      align: "right",
      width: 190,
      cell: (value) => createdAt(String(value)),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="border-pattern-200 flex gap-2 border-b text-sm">
        <button
          type="button"
          onClick={() => handleTabChange("info")}
          className={[
            "px-4 py-2",
            activeTab === "info" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Informações pessoais
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("orders")}
          className={[
            "px-4 py-2",
            activeTab === "orders" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Pedidos
        </button>
      </div>

      {activeTab === "info" && (
        <div className="space-y-4">
          <section className="flex flex-col gap-4 lg:flex-row">
            <Card>
              <h2 className="mb-3 text-lg font-bold">Dados do cliente</h2>
              <dl className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <div>
                    <dt className="text-xs uppercase">Nome completo</dt>
                    <dd className="text-sm font-semibold">{customer.name}</dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase">Documento</dt>
                    <dd className="text-sm font-semibold">
                      {customer.document || "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase">Telefone</dt>
                    <dd className="text-sm font-semibold">
                      {customer.phone || "—"}
                    </dd>
                  </div>
                </div>

                <div>
                  <dt className="text-xs uppercase">Criado por</dt>
                  <dd className="text-sm font-semibold">
                    {customer.creator?.name ?? "—"}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-semibold">Endereço</h2>

              <div className="space-y-4 text-sm">
                <p>
                  Rua: <br />
                  <span className="font-semibold">
                    {customer.street && customer.number
                      ? `${customer.street}, ${customer.number}`
                      : "—"}
                  </span>
                </p>

                <p>
                  Bairro: <br />
                  <span className="font-semibold">
                    {customer.district || "—"}
                  </span>
                </p>

                <p>
                  Cidade: <br />
                  <span className="font-semibold">
                    {customer.city && customer.state
                      ? `${customer.city} - ${customer.state}`
                      : "—"}
                  </span>
                </p>

                <p>
                  CEP: <br />
                  <span className="font-semibold">
                    {customer.postal_code ? customer.postal_code : "—"}
                  </span>
                </p>

                <p>
                  Complemento: <br />
                  <span className="font-semibold">
                    {customer.complement ? customer.complement : "—"}
                  </span>
                </p>
              </div>
            </Card>
          </section>

          <div className="flex justify-end">
            <Link href={`/customers/${customer.id}/edit`}>
              <Button className="flex items-center gap-2">Editar</Button>
            </Link>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">
            Histórico de pedidos realizados por este cliente.
          </p>

          <DataTable<SalesTableRow>
            columns={ordersColumns}
            data={pageOrders}
            rowKey={(r) => r.id}
            emptyMessage="Nenhum pedido encontrado para este cliente."
            zebra
            stickyHeader
          />

          <TablePagination
            totalItems={totalItems}
            perPage={PER_PAGE}
            currentPage={safePage}
            basePath={pathname}
            searchParams={{
              tab: "orders",
              sort: sortField,
              dir: sortDir,
            }}
          />
        </div>
      )}
    </section>
  );
}
