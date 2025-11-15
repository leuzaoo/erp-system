import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import CustomersPageClient from "./CustomersPageClient";

type SearchParams = {
  q?: string;
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: qParam = "" } = await searchParams;
  const rawQ = qParam.trim();

  await requireRole(["admin"]);
  const supabase = await supabaseRSC();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, document, postal_code, state, created_at");

  if (error) {
    return <pre className="text-red-600">Erro: {error.message}</pre>;
  }

  const normalize = (value: string | null | undefined): string =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  let filtered = customers ?? [];

  if (rawQ) {
    const q = normalize(rawQ.replace(/^#/, ""));

    filtered = filtered.filter((o) => {
      const customerName = normalize(o.name);
      const customerDocument = normalize(o.document);
      const customerPostalCode = normalize(o.postal_code);

      return (
        customerName.includes(q) ||
        customerDocument.includes(q) ||
        customerPostalCode.includes(q)
      );
    });
  }

  return (
    <CustomersPageClient
      customers={filtered}
      totalCount={customers?.length ?? 0}
      rawQ={rawQ}
    />
  );
}
