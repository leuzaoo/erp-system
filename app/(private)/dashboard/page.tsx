import Link from "next/link";

import type { OrderRow } from "@/types/OrderRow";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { requireAuth } from "@/utils/auth/requireAuth";
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

function countOrdersReadyToProduce(orders: { status: string }[] = []) {
  return orders.filter((order) => order.status === "APROVADO").length;
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const supabase = await supabaseRSC();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <pre className="text-red-600">
        Erro ao carregar perfil: {profileError?.message}
      </pre>
    );
  }

  const userRole = profile.role as "admin" | "vendedor" | "fabrica";

  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot, created_at, status, total_price, customer_id, seller_id",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (userRole === "fabrica") {
    ordersQuery = ordersQuery.eq("status", "APROVADO");
  }

  const { data: orders, error } = await ordersQuery;

  if (error) {
    return <pre className="text-red-600">Erro: {error.message}</pre>;
  }

  let customersCount = 0;

  if (userRole === "admin") {
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id");

    if (customersError) {
      return (
        <pre className="text-red-600">
          Erro ao renderizar clientes: {customersError.message}
        </pre>
      );
    }

    customersCount = customers?.length ?? 0;
  } else if (userRole === "vendedor") {
    const { count, error: customersError } = await supabase
      .from("orders")
      .select("customer_id", { count: "exact", head: true })
      .eq("seller_id", profile.id);

    if (customersError) {
      return (
        <pre className="text-red-600">
          Erro ao renderizar clientes: {customersError.message}
        </pre>
      );
    }

    customersCount = count ?? 0;
  }

  const totalOrdersPrice = sumOrdersTotal(orders || []);
  const ordersInProduction = countOrdersInProduction(orders || []);
  const ordersReadyToProduce = countOrdersReadyToProduce(orders || []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>

      <div className="flex items-center gap-4 overflow-x-auto pb-4">
        {userRole === "fabrica" ? (
          <KpiCard title="Pronto para fabricar" value={ordersReadyToProduce} />
        ) : (
          <>
            <KpiCard title="Vendas no mês" value={orders?.length ?? 0} />
            <KpiCard title="Em fabricação" value={ordersInProduction} />
            <KpiCard title="Clientes cadastrados" value={customersCount} />
            <KpiCard
              title="Total das vendas"
              value={brazilianCurrency(totalOrdersPrice)}
            />
          </>
        )}
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
