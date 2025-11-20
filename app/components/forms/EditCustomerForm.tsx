"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { updateCustomerAction } from "@/app/actions/customer-actions";
import type { CustomersTableRow } from "@/types/CustomersTableRow";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

export default function EditCustomerForm({
  customer,
}: {
  customer: CustomersTableRow;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      name: String(form.get("name") || "").trim(),
      document: String(form.get("document") || "").trim() || undefined,
      phone: String(form.get("phone") || "").trim(),
      state: String(form.get("state") || "").trim(),
      city: String(form.get("city") || "").trim(),
      district: String(form.get("district") || "").trim(),
      street: String(form.get("street") || "").trim(),
      number: String(form.get("number") || "").trim(),
      complement: String(form.get("complement") || "").trim() || undefined,
      postal_code: String(form.get("postal_code") || "").trim(),
    };

    if (
      !payload.name ||
      !payload.phone ||
      !payload.state ||
      !payload.city ||
      !payload.district ||
      !payload.street ||
      !payload.number ||
      !payload.postal_code
    ) {
      setError(
        "Por favor, preencha todos os campos obrigatórios (*) antes de salvar.",
      );
      return;
    }

    setSubmitting(true);
    const res = await updateCustomerAction(customer.id, payload);

    if (!res.ok) {
      setSubmitting(false);
      setError(res.message ?? "Não foi possível atualizar o cliente.");
      return;
    }

    router.push(`/customers/${customer.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="mb-3 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <Input name="name" label="Nome*" defaultValue={customer.name} autoFocus />
      <Input
        name="document"
        label="Documento"
        defaultValue={customer.document ?? ""}
      />
      <Input
        name="phone"
        label="Telefone*"
        defaultValue={customer.phone ?? ""}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="state"
          label="Estado*"
          defaultValue={customer.state ?? ""}
        />
        <Input name="city" label="Cidade*" defaultValue={customer.city ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="district"
          label="Bairro*"
          defaultValue={customer.district ?? ""}
        />
        <Input
          name="postal_code"
          label="CEP*"
          defaultValue={customer.postal_code ?? ""}
        />
      </div>

      <Input name="street" label="Rua*" defaultValue={customer.street ?? ""} />

      <div className="grid grid-cols-2 gap-3">
        <Input
          name="number"
          label="Número*"
          defaultValue={customer.number ?? ""}
        />
        <Input
          name="complement"
          label="Complemento"
          defaultValue={customer.complement ?? ""}
        />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.back();
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex w-40 justify-center hover:bg-blue-600"
          disabled={submitting}
        >
          {submitting ? <Loader2Icon className="animate-spin" /> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
