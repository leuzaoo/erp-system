import { supabaseRSC } from "@/utils/supabase/rsc";

type OrderRow = {
  id: string;
  number: string | null;
  created_at: string;
  status: string;
  total_price: number | string;
  customer_id: string;
  seller_id: string;
};

export default async function DashboardPage() {
  const supabase = await supabaseRSC();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, number, created_at, status, total_price, customer_id, seller_id",
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
          <table className="w-full border-collapse">
            <thead className="bg-neutral-900/60">
              <tr className="text-left text-sm text-neutral-300">
                <th className="border-b border-neutral-800 p-3">Pedido</th>
                <th className="border-b border-neutral-800 p-3">
                  Cliente (id)
                </th>
                <th className="border-b border-neutral-800 p-3">
                  Vendedor (id)
                </th>
                <th className="border-b border-neutral-800 p-3">Status</th>
                <th className="border-b border-neutral-800 p-3">Valor</th>
                <th className="border-b border-neutral-800 p-3">Criado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: OrderRow) => (
                <tr key={o.id} className="text-sm">
                  <td className="border-b border-neutral-900 p-3">
                    {o.number ?? o.id.slice(0, 8)}
                  </td>
                  <td className="border-b border-neutral-900 p-3">
                    {o.customer_id.slice(0, 8)}…
                  </td>
                  <td className="border-b border-neutral-900 p-3">
                    {o.seller_id.slice(0, 8)}…
                  </td>
                  <td className="border-b border-neutral-900 p-3">
                    {o.status}
                  </td>
                  <td className="border-b border-neutral-900 p-3">
                    R$ {Number(o.total_price).toFixed(2)}
                  </td>
                  <td className="border-b border-neutral-900 p-3">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
