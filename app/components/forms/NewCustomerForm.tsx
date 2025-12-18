import { Loader2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import * as React from "react";

import { createCustomerAction } from "@/app/actions/customer-actions";

import { BRAZIL_STATES } from "@/utils/brazilEstates";
import {
  CPF_DIGITS,
  formatBrazilianDocument,
  getBrazilianDocumentKind,
  isValidBrazilianDocumentDigits,
  RG_MAX_DIGITS,
  RG_MIN_DIGITS,
  stripNonDigits,
} from "@/utils/brazilianDocuments";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

interface NewCustomerFormProps {
  closeModal: () => void;
  onCreated: (customer: { id: string; name: string }) => void;
}

const NewCustomerForm = ({ closeModal, onCreated }: NewCustomerFormProps) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [documentValue, setDocumentValue] = React.useState("");
  const [documentTouched, setDocumentTouched] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    const name = String(form.get("name") || "").trim();
    const documentDigits = stripNonDigits(documentValue).slice(0, CPF_DIGITS);
    const document = documentDigits.length > 0 ? documentDigits : undefined;
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

    if (!isValidBrazilianDocumentDigits(documentDigits)) {
      setDocumentTouched(true);
      setError(
        `Documento inválido. Use RG (${RG_MIN_DIGITS}–${RG_MAX_DIGITS} dígitos) ou CPF (${CPF_DIGITS} dígitos).`,
      );
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
    toast.success("Cliente cadastrado com sucesso.");
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
          <div>
            <Input
              name="document"
              label="Documento"
              placeholder="CPF ou RG"
              inputMode="numeric"
              value={documentValue}
              onBlur={() => setDocumentTouched(true)}
              onChange={(e) => {
                const digits = stripNonDigits(e.target.value).slice(
                  0,
                  CPF_DIGITS,
                );
                setDocumentValue(formatBrazilianDocument(digits));
              }}
            />
            {documentValue && (
              <div className="mt-1 flex items-center justify-between text-xs text-neutral-600">
                <span>
                  Tipo detectado:{" "}
                  <span className="font-semibold">
                    {getBrazilianDocumentKind(stripNonDigits(documentValue))}
                  </span>
                </span>
                <span>{stripNonDigits(documentValue).length} dígitos</span>
              </div>
            )}
            {documentTouched &&
              documentValue &&
              !isValidBrazilianDocumentDigits(
                stripNonDigits(documentValue),
              ) && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  Documento inválido. Use RG ({RG_MIN_DIGITS}–{RG_MAX_DIGITS}{" "}
                  dígitos) ou CPF ({CPF_DIGITS} dígitos).
                </p>
              )}
          </div>
          <Input name="phone" label="Telefone*" />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-700">
                Estado*
              </label>

              <select
                name="state"
                required
                className="bg-pattern-100 h-10 rounded-md border border-neutral-300 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione um estado
                </option>

                {BRAZIL_STATES.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

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

          <div className="mt-5 flex w-full justify-end gap-3">
            <Button
              type="button"
              className="min-w-max"
              onClick={closeModal}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex w-32 min-w-max justify-center hover:bg-blue-600"
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
