"use client";

import * as React from "react";

import { brazilianCurrency } from "@/utils/brazilianCurrency";

import Card from "@/app/components/Card";

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
  };
};

export default function ProfileDetailsTabs({ info, sales }: Props) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("info");

  const isFactory = sales.role === "fabrica";

  return (
    <section className="mt-4 space-y-4">
      <div className="flex gap-2 border-b border-neutral-200 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={[
            "px-4 py-2",
            activeTab === "info" ? activeClass : inactiveClass,
          ].join(" ")}
        >
          Informações
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sales")}
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
          <p className="text-sm text-neutral-500">
            Resumo da sua performance no sistema.
          </p>

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
        </div>
      )}
    </section>
  );
}
