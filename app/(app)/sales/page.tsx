import { supabaseRSC } from "@/utils/supabase/rsc";

function fmtBRL(v: number | string) {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "-";
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams?.q ?? "").trim();

  const supabase = await supabaseRSC();

  let query = supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot, total_price, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (q) {
    query = query.or(`customer_name_snapshot.ilike.%${q}%,number.ilike.%${q}%`);
  }

  const { data: orders, error } = await query;

  if (error) {
    return <pre className="text-red-400">Erro: {error.message}</pre>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Vendas</h1>

      <form className="flex gap-2" action="/sales" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por cliente ou número…"
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:border-neutral-600"
        />
        <button
          className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 hover:bg-neutral-700"
          type="submit"
        >
          Buscar
        </button>
      </form>

      <ul className="space-y-3">
        {orders?.map((o) => (
          <li
            key={o.id}
            className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4"
          >
            <p className="font-semibold">
              Pedido <span className="uppercase">#{o.id.slice(0, 6)}</span> —{" "}
              {o.customer_name_snapshot}
            </p>
            <div className="mt-1 text-sm text-neutral-300">
              Vendedor: {o.seller_name_snapshot}
            </div>
            <div className="mt-1 text-sm">
              Valor: <strong>{fmtBRL(o.total_price)}</strong>
            </div>
            <div className="mt-1 text-sm">Status: {o.status}</div>
            <div className="mt-1 text-xs text-neutral-500">
              Criado em: {new Date(o.created_at).toLocaleString("pt-BR")}
            </div>
          </li>
        ))}

        {!orders?.length && (
          <li className="text-neutral-400">Nenhuma venda encontrada.</li>
        )}
      </ul>
    </div>
  );
}
