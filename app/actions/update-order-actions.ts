"use server";

import { canEditOrder, type AppRole } from "@/utils/permissions";
import { supabaseAction } from "@/utils/supabase/action";

type UpdateOrderItemInput = {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  asked_length_cm?: number | null;
  asked_width_cm?: number | null;
  asked_height_cm?: number | null;
};

export type UpdateOrderPayload = {
  orderId: string;
  status: string;
  items: UpdateOrderItemInput[];
};

export type UpdateOrderResult = { ok: true } | { ok: false; message?: string };

export async function updateOrder(
  payload: UpdateOrderPayload,
): Promise<UpdateOrderResult> {
  const supabase = await supabaseAction();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "vendedor") as AppRole;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, seller_id")
    .eq("id", payload.orderId)
    .single();

  if (orderErr || !order) {
    return { ok: false, message: "Pedido não encontrado." };
  }

  const allowed = canEditOrder({
    role,
    userId: user.id,
    sellerId: order.seller_id,
  });

  if (!allowed) {
    return { ok: false, message: "Você não pode editar este pedido." };
  }

  if (!payload.items?.length) {
    return { ok: false, message: "Informe ao menos um item." };
  }

  const { data: existingItems, error: existingItemsErr } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", payload.orderId);

  if (existingItemsErr) {
    return {
      ok: false,
      message: "Erro ao carregar itens atuais do pedido.",
    };
  }

  const existingIds = new Set(
    (existingItems || []).map((it: { id: string }) => it.id),
  );

  const payloadWithId = payload.items.filter((it) => !!it.id);
  const payloadIds = new Set(payloadWithId.map((it) => String(it.id)));

  const idsToDelete = [...existingIds].filter((id) => !payloadIds.has(id));

  if (idsToDelete.length) {
    const { error: deleteErr } = await supabase
      .from("order_items")
      .delete()
      .in("id", idsToDelete);

    if (deleteErr) {
      return {
        ok: false,
        message: `Erro ao remover itens do pedido: ${deleteErr.message}`,
      };
    }
  }

  for (const it of payloadWithId) {
    const { error: itemErr } = await supabase
      .from("order_items")
      .update({
        product_id: it.product_id,
        quantity: it.quantity,
        unit_price: it.unit_price,
        asked_length_cm: it.asked_length_cm ?? null,
        asked_width_cm: it.asked_width_cm ?? null,
        asked_height_cm: it.asked_height_cm ?? null,
        line_total: it.quantity * it.unit_price,
      })
      .eq("id", it.id)
      .eq("order_id", payload.orderId);

    if (itemErr) {
      return {
        ok: false,
        message: `Erro ao atualizar itens: ${itemErr.message}`,
      };
    }
  }

  const newItems = payload.items.filter((it) => !it.id);

  if (newItems.length) {
    const toInsert = newItems.map((it) => ({
      order_id: payload.orderId,
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: it.unit_price,
      asked_length_cm: it.asked_length_cm ?? null,
      asked_width_cm: it.asked_width_cm ?? null,
      asked_height_cm: it.asked_height_cm ?? null,
      line_total: it.quantity * it.unit_price,
    }));

    const { error: insertErr } = await supabase
      .from("order_items")
      .insert(toInsert);

    if (insertErr) {
      return {
        ok: false,
        message: `Erro ao adicionar novos itens: ${insertErr.message}`,
      };
    }
  }

  const { data: refreshedItems, error: loadItemsErr } = await supabase
    .from("order_items")
    .select("line_total")
    .eq("order_id", payload.orderId);

  if (loadItemsErr || !refreshedItems) {
    return {
      ok: false,
      message: "Erro ao recalcular total do pedido.",
    };
  }

  const total = refreshedItems.reduce(
    (acc, it) => acc + Number(it.line_total || 0),
    0,
  );

  const updates: Partial<{ status: string; total_price: number }> = {
    total_price: total,
  };

  updates.status = payload.status;

  const { error: updateOrderErr } = await supabase
    .from("orders")
    .update({
      status: payload.status,
      total_price: total,
    })
    .eq("id", payload.orderId);

  if (updateOrderErr) {
    console.error(
      "updateOrderErr FULL:",
      JSON.stringify(updateOrderErr, null, 2),
    );

    return {
      ok: false,
      message: `Erro ao atualizar pedido: ${updateOrderErr.message}`,
    };
  }

  return { ok: true };
}
