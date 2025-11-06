// app/(app)/sales/new/page.tsx
import NewSaleForm from "@/app/components/forms/NewSaleForm";
import { supabaseRSC } from "@/utils/supabase/rsc";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const supabase = await supabaseRSC();

  // Carrega listas básicas para o formulário
  const [{ data: customers }, { data: products }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("products")
      .select(
        "id, name, price, max_length_cm, max_width_cm, max_height_cm, active",
      )
      .eq("active", true)
      .order("name", { ascending: true }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nova venda</h1>
      <p className="text-neutral-400">
        Preencha os dados abaixo. Você pode adicionar vários itens ao pedido.
      </p>

      <NewSaleForm customers={customers ?? []} products={products ?? []} />
    </div>
  );
}
