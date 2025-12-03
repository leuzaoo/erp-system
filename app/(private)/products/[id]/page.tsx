import { ChevronLeftIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import Button from "@/app/components/Button";
import Card from "@/app/components/Card";

export default async function ProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <pre className="text-red-400">ID inválido.</pre>;
  }

  await requireRole(["admin"]);
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

  const formattedPrice = Number(product.price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const createdAt = new Date(product.created_at).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isActive = Boolean(product.active);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/products"
          className="flex max-w-max items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-900 hover:underline"
        >
          <ChevronLeftIcon size={16} /> Voltar
        </Link>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {product.name}
            </h1>
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-1 text-xs font-medium",
                isActive
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700",
              )}
            >
              <span
                className={clsx(
                  "h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-emerald-500" : "bg-red-500",
                )}
              />
              {isActive ? "Ativo" : "Inativo"}
            </span>
          </div>

          <div className="text-pattern-600 flex flex-wrap items-center gap-3 text-sm">
            <p className="text-2xl font-semibold">{formattedPrice}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 sm:items-end">
          <div className="text-right">
            <span className="text-pattern-400 text-xs">
              Criado em:{" "}
              <span className="font-medium text-neutral-800">{createdAt}</span>
            </span>
          </div>

          <Link href={`/products/edit/${product.id}`}>
            <Button className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm">
              <PencilIcon size={16} /> Editar produto
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <h1 className="text-xl font-bold">Dimensões máximas permitidas</h1>
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col bg-white shadow-sm">
            <span className="text-lg font-medium">Comprimento (cm)</span>{" "}
            <span className="text-pattern-600 text-2xl font-bold">
              {product.max_length_cm ?? "-"}
            </span>
          </Card>
          <Card className="flex flex-col bg-white shadow-sm">
            <span className="text-lg font-medium">Largura máxima (cm)</span>{" "}
            <span className="text-pattern-600 text-2xl font-bold">
              {product.max_width_cm ?? "-"}
            </span>
          </Card>
          <Card className="flex flex-col bg-white shadow-sm">
            <span className="text-lg font-medium">Altura máxima (cm)</span>{" "}
            <span className="text-pattern-600 text-2xl font-bold">
              {product.max_height_cm ?? "-"}
            </span>
          </Card>
        </div>
      </section>
    </div>
  );
}
