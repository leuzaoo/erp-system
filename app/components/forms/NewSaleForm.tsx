"use client";
import * as React from "react";

import { createOrder } from "@/app/(app)/sales/new-sale/actions";
import { brazilianCurrency } from "@/utils/brazilianCurrency";
import type { ItemDraft } from "@/types/ItemDraft";
import type { Customer } from "@/types/Customer";
import type { Product } from "@/types/Product";

import Input from "@/app/components/Input";
import Button from "@/app/components/Button";

type Props = {
  customers: Customer[];
  products: Product[];
};

export default function NewSaleForm({ customers, products }: Props) {
  const [customerId, setCustomerId] = React.useState<string>("");
  const [items, setItems] = React.useState<ItemDraft[]>([]);

  const addItem = () => {
    if (!products.length) return;
    const p = products[0];
    setItems((prev) => [
      ...prev,
      {
        product_id: p.id,
        quantity: 1,
        unit_price: Number(p.price || 0),
      },
    ]);
  };

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, patch: Partial<ItemDraft>) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );

  const total = items.reduce(
    (acc, it) => acc + Number(it.unit_price || 0) * Number(it.quantity || 0),
    0,
  );

  const onSubmit = async () => {
    const payload = {
      customer_id: customerId,
      items: items.map((it) => ({
        product_id: it.product_id,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        asked_length_cm:
          it.asked_length_cm === "" ? null : Number(it.asked_length_cm ?? 0),
        asked_width_cm:
          it.asked_width_cm === "" ? null : Number(it.asked_width_cm ?? 0),
        asked_height_cm:
          it.asked_height_cm === "" ? null : Number(it.asked_height_cm ?? 0),
      })),
    };

    await createOrder(payload);
  };

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-white">
            Cliente
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-0 focus:ring-2 focus:ring-neutral-600"
          >
            <option value="">Selecione um cliente…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-500">
            Procure cadastrar o cliente antes de abrir a venda.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40">
        <div className="flex items-center justify-between border-b border-neutral-800 p-3">
          <div className="font-semibold">Itens do pedido</div>
          <Button onClick={addItem} type="button">
            + Adicionar item
          </Button>
        </div>

        {!items.length && (
          <div className="p-4 text-sm text-neutral-400">
            Nenhum item adicionado.
          </div>
        )}

        <ul className="divide-y divide-neutral-800">
          {items.map((it, idx) => {
            const product = products.find((p) => p.id === it.product_id);
            const itemTotal =
              Number(it.unit_price || 0) * Number(it.quantity || 0);

            return (
              <li key={idx} className="p-4">
                <div className="grid gap-3 md:grid-cols-6">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-white">
                      Produto
                    </label>
                    <select
                      value={it.product_id}
                      onChange={(e) => {
                        const p = products.find(
                          (pp) => pp.id === e.target.value,
                        );
                        updateItem(idx, {
                          product_id: e.target.value,
                          unit_price: Number(p?.price || 0),
                        });
                      }}
                      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-0 focus:ring-2 focus:ring-neutral-600"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {product && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Máx (C×L×A):{" "}
                        {[
                          product.max_length_cm,
                          product.max_width_cm,
                          product.max_height_cm,
                        ]
                          .map((n) => (n == null ? "—" : n))
                          .join(" × ")}{" "}
                        cm
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Quantidade"
                      variant="dark"
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        updateItem(idx, { quantity: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Input
                      label="Preço unitário"
                      variant="dark"
                      type="number"
                      step="0.01"
                      value={it.unit_price}
                      onChange={(e) =>
                        updateItem(idx, { unit_price: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Input
                      label="Comprimento (cm)"
                      variant="dark"
                      type="number"
                      step="0.01"
                      value={it.asked_length_cm ?? ""}
                      onChange={(e) =>
                        updateItem(idx, {
                          asked_length_cm:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Input
                      label="Largura (cm)"
                      variant="dark"
                      type="number"
                      step="0.01"
                      value={it.asked_width_cm ?? ""}
                      onChange={(e) =>
                        updateItem(idx, {
                          asked_width_cm:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <Input
                      label="Altura (cm)"
                      variant="dark"
                      type="number"
                      step="0.01"
                      value={it.asked_height_cm ?? ""}
                      onChange={(e) =>
                        updateItem(idx, {
                          asked_height_cm:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-neutral-500">
                    Subtotal do item
                  </div>
                  <div className="font-semibold">
                    {brazilianCurrency(itemTotal)}
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Remover item
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-neutral-800 p-4">
          <div className="text-sm text-neutral-400">Total</div>
          <div className="text-lg font-bold">{brazilianCurrency(total)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!customerId || items.length === 0}
          className="min-w-40"
        >
          Salvar venda
        </Button>
      </div>
    </form>
  );
}
