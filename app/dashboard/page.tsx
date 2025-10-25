import { supabaseServer } from "@/utils/supabase/server";

type OrderRow = {
  id: string;
  number: string | null;
  created_at: string;
  status: string;
  total_price: number | string;
};

export default async function Page() {
  const supabase = await supabaseServer();

  // (opcional) se precisar do usuário:
  // const { data: { user } } = await supabase.auth.getUser();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, number, created_at, status, total_price")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return <pre>Erro: {error.message}</pre>;
  }

  return (
    <ul>
      <h1>dashboiard page</h1>
      {orders?.map((o: OrderRow) => (
        <li key={o.id}>
          #{o.number ?? o.id.slice(0, 8)} — {o.status} — R${" "}
          {Number(o.total_price).toFixed(2)}
        </li>
      ))}
    </ul>
  );
}
