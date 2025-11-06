import { PlusIcon } from "lucide-react";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import type { ItemErrors } from "@/types/ItemsErrors";
import type { ItemDraft } from "@/types/ItemDraft";
import type { Product } from "@/types/Product";

import Button from "@/app/components/Button";
import ItemRow from "./ItemRow";

type Props = {
  items: ItemDraft[];
  products: Product[];
  errors: Record<number, ItemErrors>;
  total: number;

  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;

  onChangeProduct: (idx: number, product_id: string) => void;
  onChangeUnitPrice: (idx: number, value: number | string) => void;
  onChangeQuantity: (idx: number, value: number | string) => void;

  onChangeLength: (idx: number, next: number | "") => void;
  onChangeWidth: (idx: number, next: number | "") => void;
  onChangeHeight: (idx: number, next: number | "") => void;
};

export default function ItemsSection({
  items,
  products,
  errors,
  total,
  onAddItem,
  onRemoveItem,
  onChangeProduct,
  onChangeUnitPrice,
  onChangeQuantity,
  onChangeLength,
  onChangeWidth,
  onChangeHeight,
}: Props) {
  const productOf = (product_id: string) =>
    products.find((p) => p.id === product_id);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40">
      <div className="flex items-center justify-between border-b border-neutral-800 p-3">
        <div className="font-semibold">Itens do pedido</div>
        <Button
          onClick={onAddItem}
          className="flex items-center gap-2 bg-white text-black!"
          type="button"
        >
          <PlusIcon size={16} /> Adicionar item
        </Button>
      </div>

      {!items.length && (
        <div className="p-4 text-sm text-neutral-400">
          Nenhum item adicionado.
        </div>
      )}

      <ul className="divide-y divide-neutral-800">
        {items.map((it, idx) => (
          <ItemRow
            key={idx}
            idx={idx}
            item={it}
            product={productOf(it.product_id)}
            products={products}
            err={errors[idx] || {}}
            onChangeProduct={onChangeProduct}
            onChangeUnitPrice={onChangeUnitPrice}
            onChangeQuantity={onChangeQuantity}
            onChangeLength={onChangeLength}
            onChangeWidth={onChangeWidth}
            onChangeHeight={onChangeHeight}
            onRemove={() => onRemoveItem(idx)}
          />
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-neutral-800 p-4">
        <div className="text-sm text-neutral-400">Total</div>
        <div className="text-lg font-bold">{brazilianCurrency(total)}</div>
      </div>
    </div>
  );
}
