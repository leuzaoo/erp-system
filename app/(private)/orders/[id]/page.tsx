import Link from "next/link";
import {
  BoxIcon,
  CalendarIcon,
  MoveLeftIcon,
  SpeechIcon,
  UserIcon,
} from "lucide-react";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { supabaseRSC } from "@/utils/supabase/rsc";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/utils/orderStatus";

import { requireRole } from "@/utils/auth/requireRole";

import type { OrderItemRow } from "@/types/OrderItemRow";
import type { OrderView } from "@/types/OrderView";

import Card from "@/app/components/Card";

export default async function OrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return (
      <p className="mt-10 text-center text-sm text-red-400">
        ID de pedido inválido.
      </p>
    );
  }

  const supabase = await supabaseRSC();
  const { user } = await requireRole(["admin", "vendedor", "fabrica"]);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <pre className="text-red-600">
        Erro ao carregar perfil: {profileError?.message}
      </pre>
    );
  }

  const userRole = profile.role as "admin" | "vendedor" | "fabrica";

  let ordersQuery = supabase
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
    .eq("id", id);

  if (userRole === "fabrica") {
    ordersQuery = ordersQuery.eq("status", "APROVADO");
  }

  const { data: order, error: orderError } =
    await ordersQuery.maybeSingle<OrderView>();

  if (orderError) {
    return <pre className="text-red-600">Erro: {orderError.message}</pre>;
  }

  if (!order) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-semibold">Pedido não encontrado</h1>
        <p className="opacity-50">
          Este pedido não existe ou você não tem autorização para acessá-lo.{" "}
          <br />
          Verifique o código do pedido ou fale com o administrador.
        </p>

        {userRole === "fabrica" ? (
          <Link
            href="/orders"
            className="mt-5 flex items-center gap-2 rounded px-4 py-2 text-blue-500 hover:underline"
          >
            <MoveLeftIcon size={16} />
            Página de pedidos
          </Link>
        ) : (
          <Link
            href="/sales"
            className="mt-5 flex items-center gap-2 rounded px-4 py-2 text-blue-500 hover:underline"
          >
            <MoveLeftIcon size={16} />
            Página de pedidos
          </Link>
        )}
      </div>
    );
  }

  if (orderError) {
    return (
      <p className="mt-10 text-center text-xl font-semibold text-red-600">
        Erro ao carregar os dados do pedido.
      </p>
    );
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

  const status = order.status as OrderStatus;

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

        <p
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${ORDER_STATUS_BADGE_CLASS[status]}`}
        >
          {ORDER_STATUS_LABELS[status] ?? status}
        </p>
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
                <p>{customerAddress?.complement}</p>
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

          <ul className="divide-pattern-200 divide-y">
            {order.items?.map((it: OrderItemRow) => (
              <li key={it.id} className="flex items-end justify-between py-4">
                <div className="space-y-1">
                  <div className="text-lg font-bold">
                    {it.product?.name ?? "Produto"}
                  </div>
                  <div>
                    Dimensões:{" "}
                    <span className="font-bold">
                      {it.asked_length_cm ?? "—"}x{it.asked_width_cm ?? "—"}x
                      {it.asked_height_cm ?? "—"} cm
                    </span>
                  </div>
                  <div className="opacity-50">
                    Quantidade: {it.quantity}
                    {userRole === "fabrica" ? (
                      ""
                    ) : (
                      <span>{brazilianCurrency(it.unit_price)}</span>
                    )}
                  </div>
                </div>
                {userRole === "fabrica" ? (
                  ""
                ) : (
                  <div className="text-right font-semibold">
                    {brazilianCurrency(it.line_total)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </>
  );
}
