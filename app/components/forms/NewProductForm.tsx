"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { createProduct } from "@/app/actions/product-actions";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

export function NewProductForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    const toastId = toast.loading("Salvando novo produto.");

    const formData = new FormData(e.currentTarget);

    try {
      await createProduct(formData);

      toast.success("Produto criado com sucesso.", { id: toastId });
      router.push("/products");
    } catch (err) {
      console.error(err);
      setErrorMessage("Não foi possível criar o produto.");
      toast.error("Não foi possível criar o produto.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {errorMessage && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={submitting}
          className="min-w-[120px] justify-center"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
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
