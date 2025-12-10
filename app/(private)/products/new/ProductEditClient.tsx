"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeftIcon } from "lucide-react";

import { updateProduct } from "@/app/actions/product-actions";
import { shortId } from "@/utils/shortId";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type ProductForEdit = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  max_length_cm: number | null;
  max_width_cm: number | null;
  max_height_cm: number | null;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
        {label}
      </div>
      {children}
    </div>
  );
}

export default function ProductEditClient({
  product,
}: {
  product: ProductForEdit;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await updateProduct(product.id, formData);

      if (!result?.ok) {
        toast.error(result?.message ?? "Erro ao atualizar produto.");
        return;
      }

      toast.success("Produto atualizado com sucesso.");
      // navega para a página do produto; o toast continua visível
      router.push(`/products/${product.id}`);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Erro inesperado ao atualizar produto.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/products/${product.id}`}
          className="flex items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-900 hover:underline"
        >
          <ChevronLeftIcon size={16} />
          Voltar para produto
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white/50 p-6 shadow-sm backdrop-blur">
        <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Editar produto
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Ajuste as informações do produto. As dimensões são opcionais e
              servem como limite máximo por pedido.
            </p>
          </div>

          <div className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
            ID interno:{" "}
            <span className="font-mono text-neutral-900">
              {shortId(product.id)}
            </span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome">
              <Input
                name="name"
                defaultValue={product.name}
                required
                placeholder="Ex.: Sofá retrátil"
              />
            </Field>

            <Field label="Valor (R$)">
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={String(product.price)}
                required
                placeholder="0,00"
              />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xl font-bold">
              Dimensões máximas (opcional)
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Comprimento máximo (cm)">
                <Input
                  name="max_length_cm"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.max_length_cm ?? ""}
                  placeholder="Ex.: 250"
                />
              </Field>
              <Field label="Largura máxima (cm)">
                <Input
                  name="max_width_cm"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.max_width_cm ?? ""}
                  placeholder="Ex.: 120"
                />
              </Field>
              <Field label="Altura máxima (cm)">
                <Input
                  name="max_height_cm"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.max_height_cm ?? ""}
                  placeholder="Ex.: 40"
                />
              </Field>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Esses limites serão exibidos na tela de edição de pedidos para
              ajudar na conferência das medidas.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
            <div>
              <p className="font-semibold text-neutral-800">Produto ativo</p>
              <p className="text-xs text-neutral-500">
                Desmarque para pausar o produto sem removê-lo do sistema.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product.active}
                className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-neutral-700">
                {product.active ? "Ativo" : "Inativo"}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Link href={`/products/${product.id}`}>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="px-6" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
