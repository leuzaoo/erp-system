import { ChevronLeftIcon, PencilIcon } from "lucide-react";
import Link from "next/link";

import { supabaseRSC } from "@/utils/supabase/rsc";

import { requireRole } from "@/types/RequireRoleResult";

import KpiCard from "@/app/components/KpiCard";
import Button from "@/app/components/Button";

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
  await requireRole(["admin"]);

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
          className="flex max-w-max items-center gap-2 hover:underline"
        >
          <ChevronLeftIcon size={16} /> Voltar
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Link href={`/products/edit/${product.id}`}>
          <Button>
            <PencilIcon size={16} /> Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          title="Valor"
          value={Number(product.price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
        <KpiCard title="Status" value={product.active ? "Ativo" : "Inativo"} />
        <KpiCard
          title="Comprimento máximo (cm)"
          value={product.max_length_cm ?? "-"}
        />
        <KpiCard
          title="Largura máxima (cm)"
          value={product.max_width_cm ?? "-"}
        />
        <KpiCard
          title="Altura máxima (cm)"
          value={product.max_height_cm ?? "-"}
        />
        <KpiCard
          title="Criado em"
          value={new Date(product.created_at).toLocaleString("pt-BR")}
        />
      </div>
    </div>
  );
}
