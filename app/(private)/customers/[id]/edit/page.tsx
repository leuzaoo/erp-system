import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import type { CustomersTableRow } from "@/types/CustomersTableRow";

import EditCustomerForm from "@/app/components/forms/EditCustomerForm";
import Card from "@/app/components/Card";

type PageParams = {
  id: string;
};

export default async function CustomerEditPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  await requireRole(["admin"]);

  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <pre className="text-red-400">ID inválido.</pre>;
  }

  const supabase = await supabaseRSC();

  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      `
        id, name, document, phone,
        state, city, district, street, number, complement, postal_code
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar cliente</h1>
          <p className="text-sm text-neutral-500">
            Ajuste os dados do cliente cadastrado.
          </p>
        </div>
      </header>

      <Card>
        <EditCustomerForm customer={customer} />
      </Card>
    </div>
  );
}
