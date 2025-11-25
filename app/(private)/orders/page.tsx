import { SearchIcon } from "lucide-react";
import Link from "next/link";
import moment from "moment";

import type { SalesTableRow } from "@/types/SalesTableRow";

import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
} from "@/utils/orderStatus";

import { DataTable, type Column } from "@/app/components/Table";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type SearchParams = {
  q?: string;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: qParam = "" } = await searchParams;
  const rawQ = qParam.trim();

  const { role } = await requireRole(["admin", "fabrica"]);
  const supabase = await supabaseRSC();

  let query = supabase
    .from("orders")
    .select(
      "id, number, seller_name_snapshot, seller_id, customer_id, customer_name_snapshot, total_price, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (role === "fabrica") {
    query = query.neq("status", "ENVIADO");
  }

  const { data: orders, error } = await query;

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
      const seller = normalize(o.seller_name_snapshot);
      const number = normalize(o.number);
      const idFull = normalize(o.id);
      const idShort = normalize(o.id.slice(0, 5));

      return (
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
      width: 140,
      cell: (value, row) => (
        <Link
          href={`/orders/${row.id}`}
          className="font-bold uppercase hover:underline"
        >
          #{String(value)}
        </Link>
      ),
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
        const status = String(value ?? "");

        return (
          <span
            className={
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
              (ORDER_STATUS_BADGE_CLASS[status] ?? "border border-neutral-700")
            }
          >
            {ORDER_STATUS_LABELS[status] ?? status}
          </span>
        );
      },
    },
    {
      header: "Criado em",
      accessorKey: "created_at",
      align: "right",
      width: 170,
      cell: (value) => moment(String(value)).format("DD/MM/YYYY - HH:mm"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">
          {role === "fabrica" ? "Pedidos para fabricação" : "Pedidos"}
        </h1>
      </div>

      <form className="flex max-w-lg gap-2" action="/orders" method="get">
        <Input
          name="q"
          type="text"
          placeholder="Busque por vendedor, nº do pedido ou código…"
          defaultValue={rawQ}
        />
        <Button
          type="submit"
          className="bg-darker! hover:bg-pattern-700! border-pattern-400! text-lighter! flex items-center gap-2 border"
        >
          <SearchIcon size={16} />
          Pesquisar
        </Button>
      </form>

      <DataTable<SalesTableRow>
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        caption={
          rawQ ? (
            <>
              Resultados para: “<span className="font-bold">{rawQ}</span>”.
            </>
          ) : role === "fabrica" ? (
            "Lista de pedidos (exceto os ainda não enviados para aprovação)."
          ) : undefined
        }
        emptyMessage="Nenhum pedido encontrado."
        zebra
        stickyHeader
      />
    </div>
  );
}
