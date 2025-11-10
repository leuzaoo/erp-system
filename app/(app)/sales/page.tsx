import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import moment from "moment";

import { canEditOrder, type AppRole } from "@/utils/permissions";
import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { supabaseRSC } from "@/utils/supabase/rsc";
import badgeClass from "@/utils/badgeStatus";

import { DataTable, type Column } from "@/app/components/Table";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type SalesTableRow = {
  id: string;
  number: string | null;
  customer_name_snapshot: string | null;
  seller_name_snapshot: string | null;
  seller_id: string | null;
  total_price: number;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <pre className="text-red-400">Não autenticado.</pre>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "vendedor") as AppRole;

  let query = supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot, seller_id, total_price, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    const like = `%${q}%`;
    query = query.or(
      `customer_name_snapshot.ilike.${like},number.ilike.${like}`,
    );
  }

  const { data: orders, error } = await query;
  if (error) {
    return <pre className="text-red-400">Erro: {error.message}</pre>;
  }

  const columns: Column<SalesTableRow>[] = [
    {
      header: "Pedido",
      accessorFn: (r) => r.number ?? r.id.slice(0, 5),
      cell: (value, row) => (
        <Link
          href={`/orders/${row.id}`}
          className="font-bold uppercase hover:underline"
        >
          #{String(value)}
        </Link>
      ),
      width: 120,
    },
    {
      header: "Cliente",
      accessorKey: "customer_name_snapshot",
      cell: (value) => (value ?? "—") as string,
    },
    {
      header: "Vendedor",
      accessorKey: "seller_name_snapshot",
      cell: (value) => (value ?? "—") as string,
    },
    {
      header: "Status",
      accessorKey: "status",
      width: 140,
      cell: (value) => {
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
    },
    {
      header: "Valor",
      accessorKey: "total_price",
      align: "right",
      width: 140,
      cell: (value) => (
        <span className="font-semibold">
          {brazilianCurrency(value as number)}
        </span>
      ),
    },
    {
      header: "Criado",
      accessorKey: "created_at",
      align: "right",
      width: 170,
      cell: (value) => moment(String(value)).format("DD/MM/YYYY - HH:mm"),
    },
  ];

  const columnsWithEdit: Column<SalesTableRow>[] = [
    ...columns,
    {
      header: "",
      align: "right",
      width: 80,
      cell: (_, row) => {
        const canEdit = canEditOrder({
          role,
          userId: user.id,
          sellerId: row.seller_id,
        });

        if (!canEdit) return null;

        return (
          <Link
            href={`/orders/${row.id}/edit`}
            className="rounded-md border border-neutral-400 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200"
          >
            Editar
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <Link
          href="/sales/new-sale"
          className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-lg font-semibold text-black hover:bg-neutral-200"
        >
          <PlusIcon /> Nova venda
        </Link>
      </div>

      <form className="flex max-w-lg gap-2" action="/sales" method="get">
        <Input
          name="q"
          type="text"
          placeholder="Busque por cliente, nº de venda ou código…"
          defaultValue={q}
        />
        <Button type="submit" className="flex items-center bg-darker">
          <SearchIcon size={16} />
          Pesquisar
        </Button>
      </form>

      <DataTable<SalesTableRow>
        columns={columnsWithEdit}
        data={orders ?? []}
        rowKey={(r) => r.id}
        caption={q ? `Resultados para: “${q}”` : undefined}
        emptyMessage="Nenhuma venda cadastrada."
        zebra
        stickyHeader
      />
    </div>
  );
}
