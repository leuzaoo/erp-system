import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import ProductEditClient from "../../new/ProductEditClient";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <pre className="text-red-400">ID inválido.</pre>;
  }

  const supabase = await supabaseRSC();
  await requireRole(["admin"]);

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, price, active, max_length_cm, max_width_cm, max_height_cm",
    )
    .eq("id", id)
    .single();

  if (error) return <pre className="text-red-400">Erro: {error.message}</pre>;
  if (!product) return <p>Produto não encontrado.</p>;

  return <ProductEditClient product={product} />;
}
