import { notFound } from "next/navigation";

import { requireRole } from "@/utils/auth/requireRole";
import type { OrderEdit } from "@/types/OrderEdit";

import { canEditOrder } from "@/utils/permissions";
import { supabaseRSC } from "@/utils/supabase/rsc";

import OrderEditForm from "@/app/components/forms/OrderEditForm";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) notFound();

  const supabase = await supabaseRSC();
  const { user } = await requireRole(["admin", "vendedor", "fabrica"]);

  if (!user) {
    notFound();
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) {
    notFound();
  }

  const userRole = profile.role as "admin" | "vendedor" | "fabrica";
  const isFactory = userRole === "fabrica";

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      `
      id,
      number,
      status,
      customer_id,
      customer_name_snapshot,
      seller_id,
      seller_name_snapshot,
      total_price,
      created_at,
      order_items (
        id,
        product_id,
        quantity,
        unit_price,
        asked_length_cm,
        asked_width_cm,
        asked_height_cm
      )
    `,
    )
    .eq("id", id)
    .single();

  if (orderErr) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm text-red-700">
          Erro ao carregar pedido: {orderErr.message}
        </p>
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  const allowed = canEditOrder({
    role: userRole,
    userId: user.id,
    sellerId: order.seller_id,
  });

  if (!allowed) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm text-red-700">
          Você não tem permissão para editar este pedido.
        </p>
      </div>
    );
  }

  const { data: products, error: productsErr } = await supabase
    .from("products")
    .select(
      "id, name, price, max_length_cm, max_width_cm, max_height_cm, active",
    )
    .eq("active", true)
    .order("name", { ascending: true });

  if (productsErr || !products) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm text-red-700">
          Erro ao carregar produtos para edição.
        </p>
      </div>
    );
  }

  const orderNumber = (order.number || order.id.slice(0, 5)).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Editar pedido{" "}
          <span className="font-mono text-base text-neutral-500">
            #{orderNumber}
          </span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isFactory
            ? "Altere apenas o status deste pedido. Itens, quantidades e valores são somente leitura para a fábrica."
            : "Ajuste itens, dimensões e status deste pedido."}
        </p>
      </div>

      <OrderEditForm
        order={{
          id: order.id,
          number: order.number,
          status: order.status,
          customer_name: order.customer_name_snapshot,
          seller_name: order.seller_name_snapshot,
          items:
            order.order_items?.map((it: OrderEdit) => ({
              id: it.id,
              product_id: it.product_id,
              quantity: it.quantity,
              unit_price: it.unit_price,
              asked_length_cm: it.asked_length_cm ?? "",
              asked_width_cm: it.asked_width_cm ?? "",
              asked_height_cm: it.asked_height_cm ?? "",
            })) ?? [],
        }}
        products={products}
        mode={isFactory ? "status-only" : "full"}
        hidePrices={isFactory}
      />
    </div>
  );
}
