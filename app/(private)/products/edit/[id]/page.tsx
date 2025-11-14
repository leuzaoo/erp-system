import Link from "next/link";

import { supabaseRSC } from "@/utils/supabase/rsc";

import { requireRole } from "@/types/RequireRoleResult";

import Input from "@/app/components/Input";
import Button from "@/app/components/Button";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-neutral-400">{label}</div>
      {children}
    </div>
  );
}

export default async function ProductEditPage({
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
      "id, name, price, active, max_length_cm, max_width_cm, max_height_cm",
    )
    .eq("id", id)
    .single();

  if (error) return <pre className="text-red-400">Erro: {error.message}</pre>;
  if (!product) return <p>Produto não encontrado.</p>;

  async function action(formData: FormData) {
    "use server";
    const { updateProduct } = await import(
      "../../../../actions/product-actions"
    );
    await updateProduct(product?.id, formData);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Editar Produto</h1>

      <form action={action} className="space-y-4">
        <Field label="Nome">
          <Input name="name" defaultValue={product.name} required />
        </Field>

        <Field label="Valor">
          <Input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={String(product.price)}
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Comprimento máximo (cm)">
            <Input
              name="max_length_cm"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.max_length_cm ?? ""}
            />
          </Field>
          <Field label="Largura máxima (cm)">
            <Input
              name="max_width_cm"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.max_width_cm ?? ""}
            />
          </Field>
          <Field label="Altura máxima (cm)">
            <Input
              name="max_height_cm"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.max_height_cm ?? ""}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product.active}
            className="accent-neutral-200"
          />
          Ativo
        </label>

        <div className="flex gap-2">
          <Link href={`/products/${product.id}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  );
}
