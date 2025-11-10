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

  const [
    { data: customer, error: customerErr },
    { data: sellerProfile, error: sellerErr },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("name")
      .eq("id", payload.customer_id)
      .single(),
    supabase.from("profiles").select("name").eq("id", user.id).single(),
  ]);

  if (customerErr) {
    return {
      ok: false,
      message: "Não foi possível carregar os dados do cliente.",
    };
  }

  if (sellerErr) {
    return {
      ok: false,
      message: "Não foi possível carregar os dados do vendedor.",
    };
  }

  const customerName = customer?.name ?? "Cliente";
  const sellerName = sellerProfile?.name ?? "Vendedor";

  const itemsWithLineTotal = payload.items.map((it) => ({
    ...it,
    line_total: it.quantity * it.unit_price,
  }));

  const total = itemsWithLineTotal.reduce((acc, it) => acc + it.line_total, 0);

  const { data: createdOrder, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_id: payload.customer_id,
      seller_id: user.id,
      status: "ENVIADO",
      total_price: total,
      customer_name_snapshot: customerName,
      seller_name_snapshot: sellerName,
    })
    .select("id")
    .single();

  if (orderErr || !createdOrder) {
    return {
      ok: false,
      message: orderErr?.message || "Erro ao criar o pedido.",
    };
  }

  const orderId = createdOrder.id;

  const itemsToInsert = itemsWithLineTotal.map((it) => ({
    order_id: orderId,
    product_id: it.product_id,
    quantity: it.quantity,
    unit_price: it.unit_price,
    asked_length_cm:
      typeof it.asked_length_cm === "number" ? it.asked_length_cm : null,
    asked_width_cm:
      typeof it.asked_width_cm === "number" ? it.asked_width_cm : null,
    asked_height_cm:
      typeof it.asked_height_cm === "number" ? it.asked_height_cm : null,
    line_total: it.line_total,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsErr) {
    return {
      ok: false,
      message:
        itemsErr.message ||
        "Erro ao adicionar itens do pedido. Nenhum item foi salvo.",
    };
  }

  return { ok: true, orderId };
}
