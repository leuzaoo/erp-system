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
    const phone = String(form.get("phone") || "").trim();
    const state = String(form.get("state") || "").trim();
    const city = String(form.get("city") || "").trim();
    const district = String(form.get("district") || "").trim();
    const street = String(form.get("street") || "").trim();
    const number = String(form.get("number") || "").trim();
    const complement = String(form.get("complement") || "").trim() || undefined;
    const postal_code = String(form.get("postal_code") || "").trim();

    if (
      !name ||
      !phone ||
      !state ||
      !city ||
      !district ||
      !street ||
      !number ||
      !postal_code
    ) {
      setError("Preencha todos os campos obrigatórios (*) antes de salvar.");
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
      <div className="bg-lighter text-darker w-full max-w-lg rounded-xl border p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Cadastrar cliente</h2>
          <XIcon
            onClick={closeModal}
            className="cursor-pointer opacity-50 hover:opacity-100"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="name" label="Nome*" required autoFocus />
          <Input name="document" label="Documento" />
          <Input name="phone" label="Telefone*" />

          <div className="grid grid-cols-2 gap-3">
            <Input name="state" label="Estado*" />
            <Input name="city" label="Cidade*" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input name="district" label="Bairro*" />
            <Input name="postal_code" label="CEP*" />
          </div>

          <Input name="street" label="Rua*" />

          <div className="grid grid-cols-2 gap-3">
            <Input name="number" label="Número*" />
            <Input name="complement" label="Complemento" />
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" onClick={closeModal} variant="outline">
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
          {error && (
            <div className="mb-3 rounded-md border border-red-800 bg-red-200 px-3 py-2 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewCustomerForm;
