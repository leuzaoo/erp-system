import { redirect } from "next/navigation";
import Link from "next/link";

import type { OrderRow } from "@/types/OrderRow";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { supabaseRSC } from "@/utils/supabase/rsc";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGE_CLASS,
} from "@/utils/orderStatus";

import { DataTable } from "@/app/components/Table";
import KpiCard from "@/app/components/KpiCard";

function sumOrdersTotal(orders: { total_price: number }[] = []) {
  return orders.reduce((acc, order) => acc + Number(order.total_price || 0), 0);
}

function countOrdersInProduction(orders: { status: string }[] = []) {
  return orders.filter((order) => order.status === "FABRICACAO").length;
}

export default async function DashboardPage() {
  const supabase = await supabaseRSC();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot,created_at, status, total_price, customer_id, seller_id",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id");

  if (error) {
    return <pre className="text-red-600">Erro: {error.message}</pre>;
  }

  if (customersError) {
    <pre className="text-red-600">
      Erro ao renderizar clientes: {customersError.message}
    </pre>;
  }

  const totalOrdersPrice = sumOrdersTotal(orders || []);
  const ordersInProduction = countOrdersInProduction(orders || []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <KpiCard title="Vendas no mês" value={orders?.length} />
        <KpiCard title="Em fabricação" value={ordersInProduction} />
        <KpiCard title="Clientes cadastrados" value={customers?.length} />
        <KpiCard
          title="Total das vendas"
          value={brazilianCurrency(totalOrdersPrice)}
        />
      </div>

      {!orders?.length && (
        <p className="text-pattern-800">Nenhum pedido encontrado.</p>
      )}

      {!!orders?.length && (
        <DataTable<OrderRow>
          data={orders}
          rowKey={(row) => row.id}
          emptyMessage="Nenhum pedido encontrado."
          columns={[
            {
              header: "Pedido",
              cell: (_, row) => (
                <Link
                  href={`/orders/${row.id}`}
                  className="font-bold hover:underline"
                >
                  #{(row.number ?? row.id.slice(0, 5)).toUpperCase()}
                </Link>
              ),
            },
            {
              header: "Cliente (id)",
              cell: (_, row) => <span>{row.customer_name_snapshot}</span>,
            },
            {
              header: "Vendedor (id)",
              cell: (_, row) => <span>{row.seller_name_snapshot}</span>,
            },
            {
              header: "Status",
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
              header: "Criado",
              cell: (_, row) =>
                new Date(row.created_at).toLocaleDateString("pt-BR"),
            },
          ]}
        />
      )}
    </div>
  );
}
