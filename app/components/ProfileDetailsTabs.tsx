"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import type { ProfileSale } from "@/types/ProfileSale";

import { brazilianCurrency } from "@/utils/brazilianCurrency";

import TablePagination from "@/app/components/TablePagination";
import Card from "@/app/components/Card";
import SaleCard from "./SaleCard";

type TabKey = "info" | "sales";

const activeClass = "text-blue-500 border-b-2";
const inactiveClass =
  "text-neutral-500 hover:bg-neutral-50 hover:cursor-pointer";

type Props = {
  info: React.ReactNode;
  sales: {
    ordersCount: number;
    customersCount: number;
    totalSales: number;
    role: "admin" | "vendedor" | "fabrica";
    orders: ProfileSale[];
  };
};

export default function ProfileDetailsTabs({ info, sales }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const initialTab: TabKey = tabParam === "sales" ? "sales" : "info";
  const [activeTab, setActiveTab] = React.useState<TabKey>(initialTab);

  const isFactory = sales.role === "fabrica";

  React.useEffect(() => {
    setActiveTab(searchParams.get("tab") === "sales" ? "sales" : "info");
  }, [searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());

    if (tab === "sales") {
      params.set("tab", "sales");
    } else {
      params.delete("tab");
    }

    params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const pageParam = searchParams.get("page");
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const totalItems = sales.orders.length;
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * perPage;
  const pageOrders = sales.orders.slice(start, start + perPage);

  return (
    <section className="mt-4 space-y-4">
      <div className="flex gap-2 border-b border-neutral-200 text-sm">
        <button
          type="button"
          onClick={() => handleTabChange("info")}
          className={[
            "px-4 py-2",
            activeTab === "info" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Informações
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("sales")}
          className={[
            "px-4 py-2",
            activeTab === "sales" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Minhas vendas
        </button>
      </div>

      {activeTab === "info" && <div className="space-y-4">{info}</div>}

      {activeTab === "sales" && (
        <div className="space-y-4">
          {isFactory && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              Sua função é <b>fábrica</b>. Normalmente, este perfil não registra
              vendas diretamente — por isso os números podem aparecer como 0.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex flex-col gap-1">
              <span className="text-sm text-neutral-500">
                Vendas realizadas
              </span>
              <span className="text-3xl font-bold">{sales.ordersCount}</span>
            </Card>

            <Card className="flex flex-col gap-1">
              <span className="text-sm text-neutral-500">
                Clientes cadastrados
              </span>
              <span className="text-3xl font-bold">{sales.customersCount}</span>
            </Card>

            <Card className="flex flex-col gap-1">
              <span className="text-sm text-neutral-500">Total em vendas</span>
              <span className="text-3xl font-bold">
                {brazilianCurrency(sales.totalSales)}
              </span>
            </Card>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Minhas vendas recentes</h3>
              <p className="text-xs text-neutral-500">
                Detalhes das últimas vendas registradas no sistema.
              </p>
            </div>

            {sales.orders.length === 0 ? (
              <Card className="text-sm text-neutral-500">
                Nenhuma venda registrada até o momento.
              </Card>
            ) : (
              <div className="space-y-4">
                {pageOrders.map((sale) => (
                  <SaleCard key={sale.id} sale={sale} />
                ))}
              </div>
            )}

            <TablePagination
              totalItems={totalItems}
              perPage={perPage}
              currentPage={safePage}
              basePath={pathname}
              searchParams={{ tab: "sales" }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
