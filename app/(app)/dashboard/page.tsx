import type { OrderRow } from "@/types/OrderRow";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { supabaseRSC } from "@/utils/supabase/rsc";
import badgeClass from "@/utils/badgeStatus";

import { DataTable } from "@/app/components/Table";

export default async function DashboardPage() {
  const supabase = await supabaseRSC();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot,created_at, status, total_price, customer_id, seller_id",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return <pre className="text-red-400">Erro: {error.message}</pre>;
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>

      {!orders?.length && (
        <p className="text-neutral-300">Nenhum pedido encontrado.</p>
      )}

      {!!orders?.length && (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <DataTable<OrderRow>
            data={orders}
            rowKey={(row) => row.id}
            emptyMessage="Nenhum pedido encontrado."
            columns={[
              {
                header: "Pedido",
                cell: (_, row) => (
                  <p className="font-bold">
                    #{(row.number ?? row.id.slice(0, 5)).toUpperCase()}
                  </p>
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
                cell: (_, row) => badgeClass(row.status),
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
        </div>
      )}
    </>
  );
}
