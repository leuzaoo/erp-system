import { BoxIcon, CalendarIcon, SpeechIcon, UserIcon } from "lucide-react";
import { supabaseRSC } from "@/utils/supabase/rsc";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import type { OrderItemRow } from "@/types/OrderItemRow";
import type { OrderView } from "@/types/OrderView";
import badgeClass from "@/utils/badgeStatus";
import Card from "@/app/components/Card";

export default async function OrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <pre className="text-red-400">ID inválido.</pre>;
  }

  const supabase = await supabaseRSC();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      `
        id, number, status, total_price, created_at, updated_at,
        customer_name_snapshot, seller_name_snapshot,

        customer:customers (
          id, name, phone, document,
          state, city, district, street, number, complement
        ),
        seller:profiles (
          id, name
        ),

        items:order_items (
          id, quantity, unit_price, line_total,
          asked_length_cm, asked_width_cm, asked_height_cm,
          product:products (
            id, name, price, max_length_cm, max_width_cm, max_height_cm
          )
        )
      `,
    )
    .eq("id", id)
    .single<OrderView>();

  if (orderErr) {
    return <pre className="text-red-400">Erro: {orderErr.message}</pre>;
  }
  if (!order) {
    return <p className="text-neutral-300">Pedido não encontrado.</p>;
  }

  const orderNumber = (order.number ?? order.id.slice(0, 5)).toUpperCase();

  const customerName =
    order.customer?.name ?? order.customer_name_snapshot ?? "Cliente";
  const sellerName =
    order.seller?.name ?? order.seller_name_snapshot ?? "Vendedor";

  const customerAddress = order.customer;

  const createdAt = new Date(order.created_at).toLocaleString("pt-BR");
  const updatedAt = order.updated_at
    ? new Date(order.updated_at).toLocaleString("pt-BR")
    : "—";

  console.log(order);

  return (
    <>
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">
            Pedido: <span className="font-bold">#{orderNumber}</span>
          </h1>
          <p className="mt-1 text-sm font-light opacity-70">
            Detalhes do pedido
          </p>
        </div>

        <span>{badgeClass(order.status)}</span>
      </section>

      <section>
        <div className="mt-10 flex justify-between gap-4">
          <Card>
            <div className="flex items-start gap-2">
              <UserIcon />
              <h2 className="text-xl font-bold">Cliente</h2>
            </div>
            <div className="mt-2 flex flex-col">
              <span>{customerName}</span>

              <div className="mt-2 flex flex-col text-sm opacity-70">
                <p>
                  {customerAddress?.city}, {customerAddress?.state}
                </p>
                <p>
                  {customerAddress?.street}, {customerAddress?.number} -{" "}
                  {customerAddress?.district}
                </p>
                <p>{order.customer?.complement}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-2">
              <SpeechIcon />
              <h2 className="text-xl font-bold">Vendedor</h2>
            </div>
            <div className="mt-2 flex flex-col">
              <span>{sellerName}</span>
              <p className="mt-2 text-sm opacity-70">Responsável pela venda</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-2">
              <CalendarIcon />
              <h2 className="text-xl font-bold">Datas</h2>
            </div>
            <div className="mt-2 flex flex-col">
              <span>Data de criação</span>
              <p className="my-2 text-sm opacity-70">{createdAt}</p>
              <span>Última alteração</span>
              <p className="mt-2 text-sm opacity-70">{updatedAt}</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-4">
        <Card>
          <div className="flex items-center gap-2">
            <BoxIcon />
            <h3 className="text-xl font-bold">Itens do pedido</h3>
          </div>

          <ul className="mt-4 divide-y">
            {order.items?.map((it: OrderItemRow) => (
              <li key={it.id} className="flex items-start justify-between p-4">
                <div>
                  <div className="font-medium text-neutral-100">
                    {it.product?.name ?? "Produto"}
                  </div>
                  <div className="text-sm text-neutral-400">
                    Quantidade: {it.quantity} ×{" "}
                    {brazilianCurrency(it.unit_price)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Dimensões pedidas: {it.asked_length_cm ?? "—"} ×{" "}
                    {it.asked_width_cm ?? "—"} × {it.asked_height_cm ?? "—"} cm
                  </div>
                </div>
                <div className="text-right font-semibold">
                  {brazilianCurrency(it.line_total)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </>
  );
}
