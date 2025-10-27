import { supabaseServer } from "@/utils/supabase/server";

type OrderRow = {
  id: string;
  number: string | null;
  created_at: string;
  status: string;
  total_price: number | string;
  customer_id: string;
  seller_id: string;
};

export default async function Page() {
  const supabase = await supabaseServer();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, number, created_at, status, total_price, customer_id, seller_id",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return <pre>Erro: {error.message}</pre>;

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 16, fontSize: 24, fontWeight: "bold" }}>
        Dashboard
      </h1>

      {!orders?.length && <p>Nenhum pedido encontrado.</p>}

      {!!orders?.length && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccc",
          }}
        >
          <thead style={{ background: "#f1f1f1" }}>
            <tr>
              <th style={th}>Pedido</th>
              <th style={th}>Cliente (id)</th>
              <th style={th}>Vendedor (id)</th>
              <th style={th}>Status</th>
              <th style={th}>Valor</th>
              <th style={th}>Criado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: OrderRow) => (
              <tr key={o.id}>
                <td style={td}>{o.number ?? o.id.slice(0, 8)}</td>
                <td style={td}>{o.customer_id.slice(0, 8)}…</td>
                <td style={td}>{o.seller_id.slice(0, 8)}…</td>
                <td style={td}>{o.status}</td>
                <td style={td}>R$ {Number(o.total_price).toFixed(2)}</td>
                <td style={td}>
                  {new Date(o.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const th: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: 8,
  textAlign: "left",
};
const td: React.CSSProperties = { border: "1px solid #ccc", padding: 8 };
