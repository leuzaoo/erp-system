export const dynamic = "force-dynamic";
import { EyeIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { supabaseRSC } from "@/utils/supabase/rsc";
import Link from "next/link";

import KpiCard from "@/app/components/KpiCard";
import Td from "@/app/components/TdTable";
import Th from "@/app/components/ThTable";

function brazilianCurrency(v: number | string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

  if (error) return <pre className="text-red-400">Erro: {error.message}</pre>;

  const total = totalRes.count ?? 0;
  const active = activeRes.count ?? 0;
  const inactive = inactiveRes.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
        </div>

        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-neutral-900 hover:bg-white"
        >
          <PlusIcon size={16} strokeWidth={3} />
          Novo
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Total de produtos" value={total} />
        <KpiCard title="Ativos" value={active} />
        <KpiCard title="Inativos" value={inactive} />
      </div>

      <form className="flex gap-2" action="/products" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Procurar produtos..."
          className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:border-neutral-600"
        />
        <button
          className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 hover:bg-neutral-700"
          type="submit"
        >
          Buscar
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full border-collapse">
          <thead className="bg-neutral-900/60 text-sm text-neutral-300">
            <tr>
              <Th>Nome</Th>
              <Th>Valor</Th>
              <Th>Dimensões (C × L × A)</Th>
              <Th>Status</Th>
              <Th> </Th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p: Product) => (
              <tr key={p.id} className="text-sm">
                <Td>{p.name}</Td>
                <Td>{brazilianCurrency(p.price)}</Td>
                <Td>
                  {[
                    p.max_length_cm ?? "-",
                    p.max_width_cm ?? "-",
                    p.max_height_cm ?? "-",
                  ].join(" × ")}{" "}
                  cm
                </Td>
                <Td>
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs " +
                      (p.active
                        ? "border border-green-800 bg-green-900/30 text-green-300"
                        : "border border-red-800 bg-red-900/30 text-red-300")
                    }
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/products/${p.id}`}
                      className="rounded-md border border-neutral-700 px-2 py-1 hover:bg-neutral-800"
                    >
                      <EyeIcon strokeWidth={1.5} size={20} />
                    </Link>
                    <Link
                      href={`/products/edit/${p.id}`}
                      className="rounded-md border border-neutral-700 px-2 py-1 hover:bg-neutral-800"
                    >
                      <PencilIcon strokeWidth={1.5} size={20} />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        const { deleteProduct } = await import("./actions");
                        await deleteProduct(p.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-red-800 px-2 py-1 text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2Icon strokeWidth={1.5} size={20} />
                      </button>
                    </form>
                  </div>
                </Td>
              </tr>
            ))}

            {!products?.length && (
              <tr>
                <td className="p-4 text-neutral-400" colSpan={5}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
