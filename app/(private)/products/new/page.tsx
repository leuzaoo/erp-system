import Link from "next/link";

import { requireRole } from "@/utils/auth/requireRole";

import { createProduct } from "@/app/actions/product-actions";

import Input from "@/app/components/Input";
import Button from "@/app/components/Button";

export default async function NewProductPage() {
  await requireRole(["admin"]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Novo Produto</h1>

      <form action={createProduct} className="space-y-4">
        <Field label="Nome">
          <Input name="name" required />
        </Field>

        <Field label="Valor">
          <Input name="price" type="number" step="0.01" min="0" required />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Comprimento máximo (cm)">
            <Input name="max_length_cm" type="number" step="0.01" min="0" />
          </Field>
          <Field label="Largura máxima (cm)">
            <Input name="max_width_cm" type="number" step="0.01" min="0" />
          </Field>
          <Field label="Altura máxima (cm)">
            <Input name="max_height_cm" type="number" step="0.01" min="0" />
          </Field>
        </div>

        <div className="flex items-center justify-start gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked />
          Ativo
        </div>

        <div className="flex gap-2">
          <Link href="/products">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  );
}

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
