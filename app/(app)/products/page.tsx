export const dynamic = "force-dynamic";

import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { supabaseRSC } from "@/utils/supabase/rsc";

import { DataTable, type Column } from "@/app/components/Table";
import KpiCard from "@/app/components/KpiCard";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { ProductActions } from "./ProductActions";

type Product = {
  id: string;
  name: string;
  price: number | string;
  active: boolean;
  max_length_cm: number | null;
  max_width_cm: number | null;
  max_height_cm: number | null;
  created_at: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams?.q ?? "").trim();

  const supabase = await supabaseRSC();

  let query = supabase
    .from("products")
    .select(
      "id, name, price, active, max_length_cm, max_width_cm, max_height_cm, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const [{ data: products, error }, totalRes, activeRes, inactiveRes] =
    await Promise.all([
      query,
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("active", true),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("active", false),
    ]);

  if (error) {
    return <pre className="text-red-400">Erro: {error.message}</pre>;
  }

  const total = totalRes.count ?? 0;
  const active = activeRes.count ?? 0;
  const inactive = inactiveRes.count ?? 0;

  const columns: Column<Product>[] = [
    {
      header: "Nome",
      accessorKey: "name",
    },
    {
      header: "Dimensões (C × L × A)",
      align: "left",
      accessorFn: (row) => row,
      cell: (_, row) => {
        const p = row as Product;
        return (
          <>
            {[
              p.max_length_cm ?? "-",
              p.max_width_cm ?? "-",
              p.max_height_cm ?? "-",
            ].join(" × ")}{" "}
            cm
          </>
        );
      },
    },
    {
      header: "Valor",
      accessorKey: "price",
      align: "left",
      cell: (value) => (
        <span className="font-semibold">
          {brazilianCurrency(value as number | string)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "active",
      cell: (value) => {
        const isActive = Boolean(value);
        return (
          <span
            className={
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs " +
              (isActive
                ? "border border-green-800 bg-green-900/30 text-green-300"
                : "border border-red-800 bg-red-900/30 text-red-300")
            }
          >
            {isActive ? "Ativo" : "Inativo"}
          </span>
        );
      },
    },
    {
      header: "",
      align: "right",
      cell: (_, row) => {
        const p = row as Product;
        return <ProductActions id={p.id} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>

        <Link
          href="/products/new"
          className="bg-darker text-lighter hover:bg-pattern-700 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
        >
          <PlusIcon size={16} />
          Novo produto
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Total de produtos" value={total} />
        <KpiCard title="Ativos" value={active} />
        <KpiCard title="Inativos" value={inactive} />
      </div>

      <form className="flex max-w-lg gap-2" action="/products" method="get">
        <Input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Procurar produtos..."
        />
        <Button
          type="submit"
          className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
        >
          <SearchIcon size={16} />
          Pesquisar
        </Button>
      </form>

      <DataTable<Product>
        columns={columns}
        data={products ?? []}
        rowKey={(p) => p.id}
        emptyMessage="Nenhum produto encontrado."
        zebra
        stickyHeader
      />
    </div>
  );
}
