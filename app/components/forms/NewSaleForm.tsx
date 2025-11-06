"use client";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  createOrder,
  type CreateOrderResult,
} from "@/app/(app)/sales/new-sale/actions";

import { validateDimension } from "@/utils/validateDimension";

import type { ItemErrors } from "@/types/ItemsErrors";
import type { ItemDraft } from "@/types/ItemDraft";
import type { Customer } from "@/types/Customer";
import type { Product } from "@/types/Product";

import ItemsSection from "@/app/components/ItemsSection";
import Button from "@/app/components/Button";
import Link from "next/link";

type Props = { customers: Customer[]; products: Product[] };

export default function NewSaleForm({ customers, products }: Props) {
  const router = useRouter();

  const [customerId, setCustomerId] = React.useState("");
  const [items, setItems] = React.useState<ItemDraft[]>([]);
  const [errors, setErrors] = React.useState<Record<number, ItemErrors>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const productOf = (product_id: string) =>
    products.find((p) => p.id === product_id);

  const addItem = () => {
    if (!products.length) return;
    const p = products[0];
    setItems((prev) => [
      ...prev,
      {
        product_id: p.id,
        quantity: 1,
        unit_price: Number(p.price || 0),
        asked_length_cm: "",
        asked_width_cm: "",
        asked_height_cm: "",
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const updateItem = (idx: number, patch: Partial<ItemDraft>) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );

  const onChangeProduct = (idx: number, product_id: string) => {
    const p = productOf(product_id);
    const base = items[idx];
    const nextErr: ItemErrors = {
      length: validateDimension(
        "Comprimento",
        base.asked_length_cm,
        p?.max_length_cm,
      ),
      width: validateDimension("Largura", base.asked_width_cm, p?.max_width_cm),
      height: validateDimension(
        "Altura",
        base.asked_height_cm,
        p?.max_height_cm,
      ),
    };
    setErrors((prev) => ({ ...prev, [idx]: nextErr }));
    updateItem(idx, { product_id, unit_price: Number(p?.price || 0) });
  };

  const onChangeLength = (idx: number, next: number | "") => {
    const pr = productOf(items[idx].product_id);
    const msg = validateDimension("Comprimento", next, pr?.max_length_cm);
    setErrors((prev) => ({ ...prev, [idx]: { ...prev[idx], length: msg } }));
    updateItem(idx, { asked_length_cm: next });
  };

  const onChangeWidth = (idx: number, next: number | "") => {
    const pr = productOf(items[idx].product_id);
    const msg = validateDimension("Largura", next, pr?.max_width_cm);
    setErrors((prev) => ({ ...prev, [idx]: { ...prev[idx], width: msg } }));
    updateItem(idx, { asked_width_cm: next });
  };

  const onChangeHeight = (idx: number, next: number | "") => {
    const pr = productOf(items[idx].product_id);
    const msg = validateDimension("Altura", next, pr?.max_height_cm);
    setErrors((prev) => ({ ...prev, [idx]: { ...prev[idx], height: msg } }));
    updateItem(idx, { asked_height_cm: next });
  };

  const hasItemErrors = React.useMemo(
    () => Object.values(errors).some((e) => e.length || e.width || e.height),
    [errors],
  );

  const total = items.reduce(
    (acc, it) => acc + Number(it.unit_price || 0) * Number(it.quantity || 0),
    0,
  );

  const onSubmit = async () => {
    setFormError(null);

    if (!customerId) {
      setFormError("Selecione um cliente.");
      return;
    }
    if (!items.length) {
      setFormError("Adicione ao menos um item.");
      return;
    }

    const computed: Record<number, ItemErrors> = {};
    items.forEach((it, idx) => {
      const p = productOf(it.product_id);
      computed[idx] = {
        length: validateDimension(
          "Comprimento",
          it.asked_length_cm,
          p?.max_length_cm,
        ),
        width: validateDimension("Largura", it.asked_width_cm, p?.max_width_cm),
        height: validateDimension(
          "Altura",
          it.asked_height_cm,
          p?.max_height_cm,
        ),
      };
    });
    const hasComputedErrors = Object.values(computed).some(
      (e) => e.length || e.width || e.height,
    );
    if (hasComputedErrors) {
      setErrors(computed);
      setFormError(
        "Você deve preencher os campos de dimensões antes de continuar.",
      );
      return;
    }

    setSubmitting(true);
    const payload = {
      customer_id: customerId,
      items: items.map((it) => ({
        product_id: it.product_id,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        asked_length_cm: Number(it.asked_length_cm),
        asked_width_cm: Number(it.asked_width_cm),
        asked_height_cm: Number(it.asked_height_cm),
      })),
    };

    const res: CreateOrderResult = await createOrder(payload);
    setSubmitting(false);

    if (!res.ok) {
      setFormError(res.message);
      return;
    }
    router.push(`/orders/${res.orderId}`);
  };

  return (
    <div className="space-y-6">
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
        </div>
      </div>

      <ItemsSection
        items={items}
        products={products}
        errors={errors}
        total={total}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onChangeProduct={onChangeProduct}
        onChangeUnitPrice={(i, v) => updateItem(i, { unit_price: Number(v) })}
        onChangeQuantity={(i, v) => updateItem(i, { quantity: Number(v) })}
        onChangeLength={onChangeLength}
        onChangeWidth={onChangeWidth}
        onChangeHeight={onChangeHeight}
      />

      {formError && (
        <div className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {formError}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/sales">
          <Button className="border border-white bg-transparent">
            Cancelar
          </Button>
        </Link>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={
            !customerId || items.length === 0 || hasItemErrors || submitting
          }
          className="disabled:opacity-40!"
        >
          {submitting ? "Salvando…" : "Salvar venda"}
        </Button>
      </div>
    </div>
  );
}
