import { supabaseServer } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ProductViewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await supabaseServer();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, price, active, max_length_cm, max_width_cm, max_height_cm, created_at",
    )
    .eq("id", params.id)
    .single();

  if (error) return <pre className="text-red-400">Erro: {error.message}</pre>;
  if (!product) return <p>Produto não encontrado.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Link
          href={`/products/edit/${product.id}`}
          className="rounded-md border border-neutral-700 px-3 py-2 hover:bg-neutral-800"
        >
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Info
          label="Price"
          value={Number(product.price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
        <Info label="Status" value={product.active ? "Active" : "Inactive"} />
        <Info label="Max length (cm)" value={product.max_length_cm ?? "-"} />
        <Info label="Max width (cm)" value={product.max_width_cm ?? "-"} />
        <Info label="Max height (cm)" value={product.max_height_cm ?? "-"} />
        <Info
          label="Created at"
          value={new Date(product.created_at).toLocaleString("pt-BR")}
        />
      </div>

      <div>
        <Link
          href="/products"
          className="text-sm text-neutral-300 hover:underline"
        >
          ← Back to list
        </Link>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="text-sm text-neutral-400">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
