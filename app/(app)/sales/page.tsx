import { supabaseRSC } from "@/utils/supabase/rsc";
import moment from "moment";
import Link from "next/link";

import { DataTable, type Column } from "@/app/components/Table";
import Input from "@/app/components/TextField";
import Button from "@/app/components/Button";
import badgeClass from "@/utils/badgeStatus";

function brazilianCurrency(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "-";
}

type OrderRow = {
  id: string;
  number: string | null;
  customer_name_snapshot: string | null;
  seller_name_snapshot: string | null;
  total_price: number | string;
  status: string;
  created_at: string;
};

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
    .limit(50);

  if (q) {
    query = query.or(`customer_name_snapshot.ilike.%${q}%,number.ilike.%${q}%`);
  }

  const { data: orders, error } = await query;
  if (error) return <pre className="text-red-400">Erro: {error.message}</pre>;

  const columns: Column<OrderRow>[] = [
    {
      header: "Pedido",
      accessorFn: (r: OrderRow) => r.id.slice(0, 5),
      cell: (value: unknown, row: OrderRow) => (
        <Link
          href={`/orders/${row.id}`}
          className="font-bold uppercase hover:underline"
        >
          #{String(value)}
        </Link>
      ),
      width: 140,
    },
    {
      header: "Cliente",
      accessorKey: "customer_name_snapshot",
      cell: (value: unknown) => (value ?? "—") as string,
    },
    {
      header: "Vendedor",
      accessorKey: "seller_name_snapshot",
      cell: (value: unknown) => (value ?? "—") as string,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value: unknown) => {
        const v = String(value ?? "");
        return (
          <span
            className={
              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium " +
              badgeClass(v.toUpperCase())
            }
          >
            {v.toUpperCase().replaceAll("_", " ")}
          </span>
        );
      },
      width: 140,
    },
    {
      header: "Valor",
      accessorKey: "total_price",
      align: "right",
      cell: (value: unknown) => (
        <span className="font-semibold">{brazilianCurrency(value)}</span>
      ),
      width: 140,
    },
    {
      header: "Criado",
      accessorKey: "created_at",
      align: "right",
      cell: (value: unknown) =>
        moment(String(value)).format("DD/MM/YYYY - HH:mm"),
      width: 170,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Vendas</h1>

      <form className="flex gap-2" action="/sales" method="get">
        <Input
          name="q"
          type="text"
          placeholder="Busque por cliente ou nº de venda…"
          variant="dark"
          defaultValue={q}
        />
        <Button type="submit">Buscar</Button>
      </form>

      <DataTable<OrderRow>
        columns={columns}
        data={orders ?? []}
        rowKey={(r) => r.id}
        caption={q ? `Resultados para: “${q}”` : undefined}
        emptyMessage="Nenhuma venda encontrada."
        zebra
        stickyHeader
      />
    </div>
  );
}
