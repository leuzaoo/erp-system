import { supabaseRSC } from "@/utils/supabase/rsc";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import moment from "moment";

import { DataTable, type Column } from "@/app/components/Table";
import type { SalesTableRow } from "@/types/SalesTableRow";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import badgeClass from "@/utils/badgeStatus";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type SearchParams = {
  q?: string;
};

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: qParam = "" } = await searchParams;
  const rawQ = qParam.trim();

  const supabase = await supabaseRSC();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot, total_price, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <pre className="text-red-400">Erro: {error.message}</pre>;
  }

  const normalize = (value: string | null | undefined): string =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  let filtered = orders ?? [];

  if (rawQ) {
    const q = normalize(rawQ.replace(/^#/, ""));

    filtered = filtered.filter((o) => {
      const customer = normalize(o.customer_name_snapshot);
      const seller = normalize(o.seller_name_snapshot);
      const number = normalize(o.number);
      const idFull = normalize(o.id);
      const idShort = normalize(o.id.slice(0, 5));

      return (
        customer.includes(q) ||
        seller.includes(q) ||
        number.includes(q) ||
        idShort.includes(q) ||
        idFull.includes(q)
      );
    });
  }

  const columns: Column<SalesTableRow>[] = [
    {
      header: "Pedido",
      accessorFn: (r) => r.id.slice(0, 5),
      cell: (value, row) => (
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
      width: 140,
    },
    {
      header: "Valor",
      accessorKey: "total_price",
      align: "right",
      cell: (value) => (
        <span className="font-semibold">
          {brazilianCurrency(value as number | string)}
        </span>
      ),
      width: 140,
    },
    {
      header: "Criado",
      accessorKey: "created_at",
      align: "right",
      cell: (value) => moment(String(value)).format("DD/MM/YYYY - HH:mm"),
      width: 170,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <Link
          href="/sales/new-sale"
          className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-lg font-semibold text-black"
        >
          <PlusIcon /> Nova venda
        </Link>
      </div>

      <form className="flex gap-2" action="/sales" method="get">
        <Input
          name="q"
          type="text"
          placeholder="Busque por cliente, nº de venda ou código…"
          variant="dark"
          defaultValue={rawQ}
        />
        <Button type="submit">Buscar</Button>
      </form>

      <DataTable<SalesTableRow>
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        caption={rawQ ? `Resultados para: “${rawQ}”` : undefined}
        emptyMessage="Nenhuma venda encontrada."
        zebra
        stickyHeader
      />
    </div>
  );
}
