import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import CustomersPageClient from "./CustomersPageClient";

import { parseCustomersParams, type CustomersSearchParams } from "./lib/params";
import { fetchCustomersCount, fetchCustomersList } from "./lib/queries";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<CustomersSearchParams>;
}) {
  const resolvedParams = parseCustomersParams(await searchParams);

  await requireRole(["admin"]);
  const supabase = await supabaseRSC();

  const customersResult = await fetchCustomersList(supabase);
  if ("error" in customersResult) {
    return <pre className="text-red-600">Erro: {customersResult.error}</pre>;
  }

  const countResult = await fetchCustomersCount(supabase);
  if ("error" in countResult) {
    return (
      <pre className="text-red-600">
        Erro ao contar clientes: {countResult.error}
      </pre>
    );
  }

  return (
    <CustomersPageClient
      customers={customersResult.customers}
      totalCount={countResult.customersCount}
      rawQ={resolvedParams.rawQ}
    />
  );
}
