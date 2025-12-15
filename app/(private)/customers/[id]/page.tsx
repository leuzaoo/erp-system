import { PencilIcon } from "lucide-react";
import Link from "next/link";

import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";
import { createdAt } from "@/utils/createdAt";
import { shortId } from "@/utils/shortId";

import type { CustomersTableRow } from "@/types/CustomersTableRow";
import type { SalesTableRow } from "@/types/SalesTableRow";

import CustomerDetailsTabs from "@/app/components/CustomerDetailsTabs";
import Button from "@/app/components/Button";

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

  const { data: ordersRaw } = await supabase
    .from("orders")
    .select(
      `
      id,
      number,
      customer_id,
      customer_name_snapshot,
      seller_id,
      seller_name_snapshot,
      total_price,
      status,
      created_at
    `,
    )
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const orders = (ordersRaw ?? []) as SalesTableRow[];

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm">
            ID do cliente:{" "}
            <span className="font-medium">{shortId(customer.id)}</span>
          </p>
          <div className="text-sm">
            <p>Cadastrado em: {createdAt(customer.created_at)}</p>
          </div>
        </div>

        <Link href={`/customers/${customer.id}/edit`}>
          <Button className="flex items-center gap-2">
            Editar <PencilIcon size={16} />
          </Button>
        </Link>
      </section>

      <CustomerDetailsTabs customer={customer} orders={orders} />
    </div>
  );
}
