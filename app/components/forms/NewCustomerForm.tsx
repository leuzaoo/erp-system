import * as React from "react";
import { Loader2Icon, XIcon } from "lucide-react";

import { createCustomerAction } from "@/app/actions/customer-actions";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

interface NewCustomerFormProps {
  closeModal: () => void;
  onCreated: (customer: { id: string; name: string }) => void;
}

const NewCustomerForm = ({ closeModal, onCreated }: NewCustomerFormProps) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    const name = String(form.get("name") || "").trim();
    const document = String(form.get("document") || "").trim() || undefined;
    const phone = String(form.get("phone") || "").trim() || undefined;
    const state = String(form.get("state") || "").trim() || undefined;
    const city = String(form.get("city") || "").trim() || undefined;
    const district = String(form.get("district") || "").trim() || undefined;
    const street = String(form.get("street") || "").trim() || undefined;
    const number = String(form.get("number") || "").trim() || undefined;
    const complement = String(form.get("complement") || "").trim() || undefined;
    const postal_code =
      String(form.get("postal_code") || "").trim() || undefined;

    if (!name) {
      setError("Nome do cliente é obrigatório.");
      return;
    }

    setSubmitting(true);

    const res = await createCustomerAction({
      name,
      document,
      phone,
      state,
      city,
      district,
      street,
      number,
      complement,
      postal_code,
    });

    setSubmitting(false);

    if (!res.ok || !res.customer) {
      setError(res.message || "Não foi possível cadastrar o cliente.");
      return;
    }

    onCreated(res.customer);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Cadastrar cliente
          </h2>
          <XIcon
            onClick={closeModal}
            className="cursor-pointer opacity-50 hover:opacity-100"
          />
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="name" label="Nome*" variant="dark" required autoFocus />
          <Input name="document" label="Documento" variant="dark" />
          <Input name="phone" label="Telefone" variant="dark" />

          <div className="grid grid-cols-2 gap-3">
            <Input name="state" label="Estado" variant="dark" />
            <Input name="city" label="Cidade" variant="dark" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input name="district" label="Bairro" variant="dark" />
            <Input name="postal_code" label="CEP" variant="dark" />
          </div>

          <Input name="street" label="Rua" variant="dark" />

          <div className="grid grid-cols-2 gap-3">
            <Input name="number" label="Número" variant="dark" />
            <Input name="complement" label="Complemento" variant="dark" />
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button
              type="button"
              onClick={closeModal}
              className="border border-neutral-600 bg-transparent text-sm hover:bg-neutral-500/15"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex w-32 justify-center hover:bg-blue-600"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Salvar cliente"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCustomerForm;
