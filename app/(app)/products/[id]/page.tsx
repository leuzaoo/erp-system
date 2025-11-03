import { supabaseRSC } from "@/utils/supabase/rsc";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

export default async function ProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <pre className="text-red-400">ID inválido.</pre>;
  }

  const supabase = await supabaseRSC();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, price, active, max_length_cm, max_width_cm, max_height_cm, created_at",
    )
    .eq("id", id)
    .single();

  if (error) return <pre className="text-red-400">Erro: {error.message}</pre>;
  if (!product) return <p>Produto não encontrado.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/products"
          className="flex max-w-max items-center gap-2 text-neutral-300 hover:underline"
        >
          <ChevronLeftIcon size={16} /> Voltar
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Link
          href={`/products/edit/${product.id}`}
          className="rounded-md border border-neutral-700 px-3 py-2 hover:bg-neutral-800"
        >
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Info
          label="Valor"
          value={Number(product.price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
        <Info label="Status" value={product.active ? "Ativo" : "Inativo"} />
        <Info
          label="Comprimento máximo (cm)"
          value={product.max_length_cm ?? "-"}
        />
        <Info label="Largura máxima (cm)" value={product.max_width_cm ?? "-"} />
        <Info label="Altura máxima (cm)" value={product.max_height_cm ?? "-"} />
        <Info
          label="Criado em"
          value={new Date(product.created_at).toLocaleString("pt-BR")}
        />
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
