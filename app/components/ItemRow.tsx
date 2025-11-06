import { brazilianCurrency } from "@/utils/brazilianCurrency";
import type { ItemErrors } from "@/types/ItemsErrors";
import type { ItemDraft } from "@/types/ItemDraft";
import type { Product } from "@/types/Product";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type Props = {
  idx: number;
  item: ItemDraft;
  product: Product | undefined;
  products: Product[];
  err: ItemErrors;

  onChangeProduct: (idx: number, product_id: string) => void;
  onChangeUnitPrice: (idx: number, value: number | string) => void;
  onChangeQuantity: (idx: number, value: number | string) => void;

  onChangeLength: (idx: number, next: number | "") => void;
  onChangeWidth: (idx: number, next: number | "") => void;
  onChangeHeight: (idx: number, next: number | "") => void;

  onRemove: () => void;
};

export default function ItemRow({
  idx,
  item: it,
  product: p,
  products,
  err,
  onChangeProduct,
  onChangeUnitPrice,
  onChangeQuantity,
  onChangeLength,
  onChangeWidth,
  onChangeHeight,
  onRemove,
}: Props) {
  const itemTotal = Number(it.unit_price || 0) * Number(it.quantity || 0);

  return (
    <li className="p-4">
      <div className="flex flex-col gap-3">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="w-full md:col-span-2">
            <label className="mb-1 block text-sm font-bold text-white">
              Produto
            </label>
            <select
              value={it.product_id}
              onChange={(e) => onChangeProduct(idx, e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-0 focus:ring-2 focus:ring-neutral-600"
            >
              {products.map((pp) => (
                <option key={pp.id} value={pp.id}>
                  {pp.name}
                </option>
              ))}
            </select>
            {p && (
              <p className="mt-1 text-xs text-neutral-500">
                Limites (C×L×A):{" "}
                {[p.max_length_cm, p.max_width_cm, p.max_height_cm]
                  .map((n) => (n == null ? "—" : `${n}cm`))
                  .join(" × ")}
              </p>
            )}
          </div>

          <div className="w-full">
            <Input
              label="Preço unitário"
              variant="dark"
              type="number"
              step="0.01"
              value={it.unit_price}
              onChange={(e) => onChangeUnitPrice(idx, e.target.value)}
            />
          </div>

          <div className="w-full">
            <Input
              label="Quantidade"
              variant="dark"
              type="number"
              min={1}
              value={it.quantity}
              onChange={(e) => onChangeQuantity(idx, e.target.value)}
            />
          </div>
        </div>

        <div className="flex w-full items-start justify-between gap-4">
          <div className="w-full">
            <Input
              label="Comprimento (cm)"
              variant="dark"
              type="number"
              step="0.01"
              value={it.asked_length_cm ?? ""}
              onChange={(e) =>
                onChangeLength(
                  idx,
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              aria-invalid={Boolean(err.length)}
              aria-describedby={`err-length-${idx}`}
            />
            {err.length && (
              <p id={`err-length-${idx}`} className="mt-1 text-xs text-red-400">
                {err.length}
              </p>
            )}
          </div>

          <div className="w-full">
            <Input
              label="Largura (cm)"
              variant="dark"
              type="number"
              step="0.01"
              value={it.asked_width_cm ?? ""}
              onChange={(e) =>
                onChangeWidth(
                  idx,
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              aria-invalid={Boolean(err.width)}
              aria-describedby={`err-width-${idx}`}
            />
            {err.width && (
              <p id={`err-width-${idx}`} className="mt-1 text-xs text-red-400">
                {err.width}
              </p>
            )}
          </div>

          <div className="w-full">
            <Input
              label="Altura (cm)"
              variant="dark"
              type="number"
              step="0.01"
              value={it.asked_height_cm ?? ""}
              onChange={(e) =>
                onChangeHeight(
                  idx,
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              aria-invalid={Boolean(err.height)}
              aria-describedby={`err-height-${idx}`}
            />
            {err.height && (
              <p id={`err-height-${idx}`} className="mt-1 text-xs text-red-400">
                {err.height}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-neutral-500">Subtotal do item</div>
        <div className="font-semibold">{brazilianCurrency(itemTotal)}</div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          onClick={onRemove}
          className="bg-transparent! p-0! text-sm text-red-500! hover:underline"
        >
          Remover item
        </Button>
      </div>
    </li>
  );
}
