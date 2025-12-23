import Link from "next/link";

import type { ProfileSale } from "@/types/ProfileSale";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { createdAt } from "@/utils/createdAt";
import { shortId } from "@/utils/shortId";
import {
  ORDER_STATUS_BADGE_CLASS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/utils/orderStatus";

import Card from "./Card";

export default function SaleCard({ sale }: { sale: ProfileSale }) {
  const items = sale.items ?? [];
  const visibleItems = items.slice(0, 3);
  const remainingItems = items.length - visibleItems.length;
  const itemsCount = items.reduce(
    (acc, item) => acc + Number(item.quantity ?? 0),
    0,
  );
  const orderLabel = sale.number ?? shortId(sale.id);
  const customerName =
    sale.customer?.name ??
    sale.customer_name_snapshot ??
    "Cliente não informado";
  const status = String(sale.status ?? "") as OrderStatus;
  const statusLabel = ORDER_STATUS_LABELS[status] ?? sale.status ?? "Status";
  const statusClass =
    ORDER_STATUS_BADGE_CLASS[status] ?? "border border-neutral-700";

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/orders/${sale.id}`}
            className="text-lg font-semibold uppercase hover:underline"
          >
            Pedido {orderLabel}
          </Link>
          <p className="text-sm text-neutral-500">
            Criado em {createdAt(sale.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>
          <span className="text-sm font-semibold">
            {brazilianCurrency(sale.total_price)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            Venda
          </span>
          <div className="text-sm text-neutral-700">
            <span className="text-neutral-500">Itens</span>: {itemsCount}
          </div>
          <div className="text-sm text-neutral-700">
            <span className="text-neutral-500">Total</span>:{" "}
            {brazilianCurrency(sale.total_price)}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            Produtos
          </span>
          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Nenhum produto informado.
            </p>
          ) : (
            <ul className="space-y-1 text-sm text-neutral-700">
              {visibleItems.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span className="text-neutral-500">{item.quantity}x</span>
                  <span className="font-medium">
                    {item.product?.name ?? "Produto não informado"}
                  </span>
                </li>
              ))}
              {remainingItems > 0 && (
                <li className="text-xs text-neutral-500">
                  + {remainingItems} outro(s) produto(s)
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            Cliente
          </span>
          <p className="text-sm font-medium text-neutral-700">{customerName}</p>
        </div>
      </div>
    </Card>
  );
}
