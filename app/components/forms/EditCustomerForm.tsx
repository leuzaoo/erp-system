"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import type { CustomersTableRow } from "@/types/CustomersTableRow";

import { BRAZIL_STATES } from "@/utils/brazilEstates";
import {
  updateCustomerAction,
  deleteCustomerAction,
} from "@/app/actions/customer-actions";
import {
  CPF_DIGITS,
  formatBrazilianDocument,
  isValidBrazilianDocumentDigits,
  stripNonDigits,
} from "@/utils/brazilianDocuments";
import {
  CEP_DIGITS,
  formatBrazilCep,
  isValidBrazilCep,
} from "@/utils/brazilianCep";
import {
  formatBrazilPhone,
  isValidBrazilPhone,
  PHONE_MAX_DIGITS,
} from "@/utils/brazilianPhone";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

export default function EditCustomerForm({
  customer,
}: {
  customer: CustomersTableRow;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [documentValue, setDocumentValue] = React.useState(
    customer.document ? formatBrazilianDocument(customer.document) : "",
  );
  const [documentTouched, setDocumentTouched] = React.useState(false);
  const [phoneValue, setPhoneValue] = React.useState(
    customer.phone ? formatBrazilPhone(customer.phone) : "",
  );
  const [phoneTouched, setPhoneTouched] = React.useState(false);
  const [cepValue, setCepValue] = React.useState(
    customer.postal_code ? formatBrazilCep(customer.postal_code) : "",
  );
  const [cepTouched, setCepTouched] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    const phoneDigits = stripNonDigits(phoneValue).slice(0, PHONE_MAX_DIGITS);

    const documentDigits = stripNonDigits(documentValue).slice(0, CPF_DIGITS);
    const cepDigits = stripNonDigits(cepValue).slice(0, CEP_DIGITS);
    const payload = {
      name: String(form.get("name") || "").trim(),
      document: documentDigits.length ? documentDigits : undefined,
      phone: phoneDigits,
      state: String(form.get("state") || "").trim(),
      city: String(form.get("city") || "").trim(),
      district: String(form.get("district") || "").trim(),
      street: String(form.get("street") || "").trim(),
      number: String(form.get("number") || "").trim(),
      complement: String(form.get("complement") || "").trim() || undefined,
      postal_code: cepDigits,
    };

    if (
      !payload.name ||
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

    if (!isValidBrazilPhone(phoneDigits)) {
      setPhoneTouched(true);
      setError("Telefone inválido. Use DDD + 8 ou 9 dígitos.");
      return;
    }

    if (!isValidBrazilianDocumentDigits(documentDigits)) {
      setDocumentTouched(true);
      setError("Documento inválido. Use RG (7–9 dígitos) ou CPF (11 dígitos).");
      return;
    }

    if (!isValidBrazilCep(cepDigits)) {
      setCepTouched(true);
      setError("CEP inválido. Use 8 dígitos.");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Salvando novas informações...");
    const res = await updateCustomerAction(customer.id, payload);
    setSubmitting(false);

    if (!res.ok) {
      const message = res.message ?? "Não foi possível atualizar o cliente.";
      setError(message);
      toast.error(message, { id: toastId });
      return;
    }

    toast.success("Cliente atualizado com sucesso!", { id: toastId });
    router.push(`/customers/${customer.id}`);
  }

  async function handleDelete() {
    if (deleting) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o cliente "${customer.name}"?\n\n` +
        "Essa ação não pode ser desfeita.",
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await deleteCustomerAction(customer.id);

      if (!res.ok) {
        toast.error(
          res.message ??
            "Não foi possível excluir o cliente. Verifique se ele está vinculado a pedidos.",
        );
        return;
      }

      toast.success("Cliente excluído com sucesso.");
      router.push("/customers");
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao excluir cliente.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="mb-3 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <Input
          name="name"
          label="Nome*"
          defaultValue={customer.name}
          autoFocus
        />
        <Input
          name="document"
          label="Documento"
          inputMode="numeric"
          value={documentValue}
          onBlur={() => setDocumentTouched(true)}
          onChange={(e) => {
            const digits = stripNonDigits(e.target.value).slice(0, CPF_DIGITS);
            setDocumentValue(formatBrazilianDocument(digits));
          }}
        />
        {documentTouched &&
          documentValue &&
          !isValidBrazilianDocumentDigits(documentValue) && (
            <p className="text-xs font-semibold text-red-600">
              Documento inválido. Use RG (7–9 dígitos) ou CPF (11 dígitos).
            </p>
          )}
        <Input
          name="phone"
          label="Telefone*"
          inputMode="tel"
          value={phoneValue}
          onBlur={() => setPhoneTouched(true)}
          onChange={(e) => {
            const digits = stripNonDigits(e.target.value).slice(
              0,
              PHONE_MAX_DIGITS,
            );
            setPhoneValue(formatBrazilPhone(digits));
          }}
        />
        {phoneTouched && !isValidBrazilPhone(phoneValue) && (
          <p className="text-xs font-semibold text-red-600">
            Informe DDD + 8 ou 9 dígitos.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700">
              Estado*
            </label>

            <select
              name="state"
              required
              defaultValue={customer.state ?? ""}
              className="bg-pattern-100 h-10 rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

          <Input
            name="city"
            label="Cidade*"
            defaultValue={customer.city ?? ""}
          />
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
            inputMode="numeric"
            value={cepValue}
            onBlur={() => setCepTouched(true)}
            onChange={(e) => {
              const digits = stripNonDigits(e.target.value).slice(
                0,
                CEP_DIGITS,
              );
              setCepValue(formatBrazilCep(digits));
            }}
          />
          {cepTouched && !isValidBrazilCep(cepValue) && (
            <p className="text-xs font-semibold text-red-600">
              CEP inválido. Use 8 dígitos.
            </p>
          )}
        </div>

        <Input
          name="street"
          label="Rua*"
          defaultValue={customer.street ?? ""}
        />

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

        <div className="mt-5 flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
          >
            {deleting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2Icon className="h-4 w-4" />
            )}
            <span>Excluir cliente</span>
          </Button>

          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                router.back();
              }}
              disabled={submitting || deleting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex w-32 items-center justify-center hover:bg-blue-600"
              disabled={submitting || deleting}
            >
              {submitting ? (
                <p className="flex items-center gap-2">
                  Salvando{" "}
                  <Loader2Icon size={16} className="animate-spin" />{" "}
                </p>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
