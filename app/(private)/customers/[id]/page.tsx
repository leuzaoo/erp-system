import { PencilIcon } from "lucide-react";
import Link from "next/link";

import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";
import { createdAt } from "@/utils/createdAt";
import { shortId } from "@/utils/shortId";

import { CustomersTableRow } from "@/types/CustomersTableRow";

import Button from "@/app/components/Button";
import Card from "@/app/components/Card";

export default async function CustomerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const supabase = await supabaseRSC();

  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <pre className="text-red-400">ID inválido.</pre>;
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      `
      id, name, document, phone, created_by,
      district, street, number, complement, postal_code, city, state, created_at,
      creator:profiles!customers_created_by_fkey (
        id, name
      )
    `,
    )
    .eq("id", id)
    .single<CustomersTableRow>();

  if (error || !customer) {
    return (
      <pre className="text-red-600">
        Erro ao carregar cliente: {error?.message ?? "Não encontrado."}
      </pre>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="mt-1 text-sm">
            ID do cliente:{" "}
            <span className="font-medium">{shortId(customer.id)}</span>
          </p>
        </div>

        <div className="text-right text-sm">
          <p>Cadastrado em:</p>
          <p className="font-medium text-neutral-800">
            {createdAt(customer.created_at)}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4 lg:flex-row">
        <Card>
          <h2 className="mb-3 text-lg font-bold">Dados do cliente</h2>
          <dl className="grid gap-3 md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase">Nome completo</dt>
              <dd className="text-sm font-semibold">{customer.name}</dd>
            </div>

            <div>
              <dt className="text-xs uppercase">Documento</dt>
              <dd className="text-sm font-semibold">
                {customer.document || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase">Telefone</dt>
              <dd className="text-sm font-semibold">{customer.phone || "—"}</dd>
            </div>

            <div>
              <dt className="text-xs uppercase">Criado por (ID do usuário)</dt>
              <dd className="text-sm font-semibold">
                {customer.creator?.name ?? "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Endereço</h2>

          <div className="space-y-4 text-sm">
            <p>
              Rua: <br />
              <span className="font-semibold">
                {customer.street && customer.number
                  ? `${customer.street}, ${customer.number}`
                  : "—"}
              </span>
            </p>

            <p>
              Bairro: <br />{" "}
              <span className="font-semibold">{customer.district || "—"}</span>
            </p>

            <p>
              Cidade: <br />
              <span className="font-semibold">
                {customer.city && customer.state
                  ? `${customer.city} - ${customer.state}`
                  : "—"}
              </span>
            </p>

            <p>
              CEP: <br />
              <span className="font-semibold">
                {customer.postal_code ? `${customer.postal_code}` : "—"}
              </span>
            </p>

            <p>
              Complemento: <br />
              <span className="font-semibold">
                {customer.complement ? `${customer.complement}` : "—"}
              </span>
            </p>
          </div>
        </Card>
      </section>
      <Link
        href={`/customers/${customer.id}/edit`}
        className="flex items-center justify-end gap-2 text-sm"
      >
        <Button>
          <PencilIcon size={16} /> Editar
        </Button>
      </Link>
    </div>
  );
}
