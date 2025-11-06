"use server";

import { supabaseAction } from "@/utils/supabase/action";

export type CreateOrderPayload = {
  customer_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    asked_length_cm?: number | null;
    asked_width_cm?: number | null;
    asked_height_cm?: number | null;
  }>;
};

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; message: string };

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResult> {
  const supabase = await supabaseAction();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." };
  }

  if (!payload.customer_id || !payload.items?.length) {
    return { ok: false, message: "Informe o cliente e ao menos um item." };
  }

  const [{ data: customer }, { data: sellerProfile }] = await Promise.all([
    supabase
      .from("customers")
      .select("name")
      .eq("id", payload.customer_id)
      .single(),
    supabase.from("profiles").select("name").eq("id", user.id).single(),
  ]);

  const customerName = customer?.name ?? "Cliente";
  const sellerName = sellerProfile?.name ?? "Vendedor";

  const { data: createdOrder, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_id: payload.customer_id,
      seller_id: user.id,
      status: "ENVIADO",
      total_price: 0,
      customer_name_snapshot: customerName,
      seller_name_snapshot: sellerName,
    })
    .select("id")
    .single();

  if (orderErr) {
    return { ok: false, message: orderErr.message };
  }

  const itemsToInsert = payload.items.map((it) => ({
    order_id: createdOrder!.id,
    product_id: it.product_id,
    quantity: it.quantity,
    unit_price: it.unit_price,
    asked_length_cm: it.asked_length_cm ?? null,
    asked_width_cm: it.asked_width_cm ?? null,
    asked_height_cm: it.asked_height_cm ?? null,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsErr) {
    return { ok: false, message: itemsErr.message };
  }

  return { ok: true, orderId: createdOrder!.id };
}
