import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

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
      "id, name, document, phone, created_by, district, street, number, complement, postal_code, city,  state, created_at",
    )
    .eq("id", id)
    .single();

  if (error) {
    return <pre className="text-red-600">Erro: {error.message}</pre>;
  }

  return (
    <>
      <h1>Página do cliente: {customer?.name}</h1>
      <h1>{customer.phone}</h1>
    </>
  );
}
