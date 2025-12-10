"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { updateOrder } from "@/app/actions/update-order-actions";
import type { ItemErrors } from "@/types/ItemsErrors";

import ItemsSection from "@/app/components/ItemsSection";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { validateDimension } from "@/utils/validateDimension";

type Product = {
  id: string;
  name: string;
  price: number;
  max_length_cm: number | null;
  max_width_cm: number | null;
  max_height_cm: number | null;
  active?: boolean;
};

type ItemDraft = {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  asked_length_cm: number | "";
  asked_width_cm: number | "";
  asked_height_cm: number | "";
};

type OrderEditFormProps = {
  order: {
    id: string;
    number: string | null;
    status: string;
    customer_name: string | null;
    seller_name: string | null;
    items: ItemDraft[];
  };
  products: Product[];
  mode?: "full" | "status-only";
  hidePrices?: boolean;
};

export default function OrderEditForm({
  order,
  products,
  mode = "full",
  hidePrices = false,
}: OrderEditFormProps) {
  const isStatusOnly = mode === "status-only";

  const router = useRouter();

  const [status, setStatus] = React.useState(order.status);
  const [items, setItems] = React.useState<ItemDraft[]>(order.items);
  const [errors, setErrors] = React.useState<Record<number, ItemErrors>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const productOf = (product_id: string) =>
    products.find((p) => p.id === product_id);

  const total = items.reduce(
    (acc, it) => acc + Number(it.unit_price || 0) * Number(it.quantity || 0),
    0,
  );

  const onAddItem = () => {
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

  const onRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const patchItem = (idx: number, patch: Partial<ItemDraft>) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  };

  const onChangeProduct = (idx: number, product_id: string) => {
    const p = productOf(product_id);
    const base = items[idx];

    const lengthMsg = validateDimension(
      "Comprimento",
      base.asked_length_cm,
      p?.max_length_cm,
    );
    const widthMsg = validateDimension(
      "Largura",
      base.asked_width_cm,
      p?.max_width_cm,
    );
    const heightMsg = validateDimension(
      "Altura",
      base.asked_height_cm,
      p?.max_height_cm,
    );

    const nextErr: ItemErrors = {
      length: lengthMsg || undefined,
      width: widthMsg || undefined,
      height: heightMsg || undefined,
    };

    setErrors((prev) => ({ ...prev, [idx]: nextErr }));
    patchItem(idx, { product_id, unit_price: Number(p?.price || 0) });
  };

  const onChangeUnitPrice = (idx: number, value: number | string) => {
    patchItem(idx, { unit_price: Number(value) || 0 });
  };

  const onChangeQuantity = (idx: number, value: number | string) => {
    patchItem(idx, { quantity: Number(value) || 0 });
  };

  const onChangeLength = (idx: number, value: number | "") => {
    const p = productOf(items[idx].product_id);
    const msg = validateDimension("Comprimento", value, p?.max_length_cm);

    setErrors((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], length: msg || undefined },
    }));

    patchItem(idx, { asked_length_cm: value });
  };

  const onChangeWidth = (idx: number, value: number | "") => {
    const p = productOf(items[idx].product_id);
    const msg = validateDimension("Largura", value, p?.max_width_cm);

    setErrors((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], width: msg || undefined },
    }));

    patchItem(idx, { asked_width_cm: value });
  };

  const onChangeHeight = (idx: number, value: number | "") => {
    const p = productOf(items[idx].product_id);
    const msg = validateDimension("Altura", value, p?.max_height_cm);

    setErrors((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], height: msg || undefined },
    }));

    patchItem(idx, { asked_height_cm: value });
  };

  const hasItemErrors = React.useMemo(
    () => Object.values(errors).some((e) => e.length || e.width || e.height),
    [errors],
  );

  const handleSubmit = async () => {
    setFormError(null);

    if (!items.length) {
      setFormError("Adicione ao menos um item ao pedido.");
      return;
    }

    const computed: Record<number, ItemErrors> = {};
    items.forEach((it, idx) => {
      const p = productOf(it.product_id);

      const lengthMsg = validateDimension(
        "Comprimento",
        it.asked_length_cm,
        p?.max_length_cm,
      );
      const widthMsg = validateDimension(
        "Largura",
        it.asked_width_cm,
        p?.max_width_cm,
      );
      const heightMsg = validateDimension(
        "Altura",
        it.asked_height_cm,
        p?.max_height_cm,
      );

      computed[idx] = {
        length: lengthMsg || undefined,
        width: widthMsg || undefined,
        height: heightMsg || undefined,
      };
    });

    const hasComputedErrors = Object.values(computed).some(
      (e) => e.length || e.width || e.height,
    );

    if (hasComputedErrors) {
      setErrors(computed);
      setFormError(
        "Verifique as dimensões dos itens antes de salvar as alterações.",
      );
      return;
    }

    setSaving(true);

    const payload = {
      orderId: order.id,
      status,
      items: items.map((it) => ({
        id: it.id,
        product_id: it.product_id,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        asked_length_cm:
          it.asked_length_cm === "" ? null : Number(it.asked_length_cm),
        asked_width_cm:
          it.asked_width_cm === "" ? null : Number(it.asked_width_cm),
        asked_height_cm:
          it.asked_height_cm === "" ? null : Number(it.asked_height_cm),
      })),
    };

    const res = await updateOrder(payload);

    setSaving(false);

    if (!res.ok) {
      setFormError(res.message || "Não foi possível salvar o pedido.");
      return;
    }

    toast.success("Pedido atualizado com sucesso!");
    router.push(`/orders/${order.id}`);
  };

  return (
    <div className="mb-10 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <Input
            label="Cliente"
            value={order.customer_name || "Cliente"}
            disabled
          />
        </div>
        <div className="md:col-span-1">
          <Input
            label="Vendedor"
            value={order.seller_name || "Vendedor"}
            disabled
          />
        </div>
        <div className="md:col-span-1">
          <label className="mb-1 block text-sm font-semibold text-neutral-800">
            Status do pedido
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EM_ESPERA">Em espera</option>
            <option value="ENVIADO">Enviado</option>
            <option value="APROVADO">Aprovado</option>
            <option value="FABRICACAO">Fabricação</option>
            <option value="EM_INSPECAO">Em inspeção</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      <fieldset disabled={isStatusOnly}>
        <ItemsSection
          items={items}
          products={products}
          errors={errors}
          total={total}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onChangeProduct={onChangeProduct}
          onChangeUnitPrice={onChangeUnitPrice}
          onChangeQuantity={onChangeQuantity}
          onChangeLength={onChangeLength}
          onChangeWidth={onChangeWidth}
          onChangeHeight={onChangeHeight}
          hidePrices={hidePrices}
        />
      </fieldset>

      {formError && (
        <div className="rounded-md border border-red-600 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {formError}
        </div>
      )}

      <div className="flex items-center justify-between">
        {!hidePrices && (
          <div className="text-sm text-neutral-500">
            Total atual:{" "}
            <span className="font-semibold text-neutral-900">
              {brazilianCurrency(total)}
            </span>
          </div>
        )}
        {hidePrices && ""}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving || hasItemErrors}
          >
            {saving
              ? "Salvando..."
              : isStatusOnly
                ? "Salvar status"
                : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
