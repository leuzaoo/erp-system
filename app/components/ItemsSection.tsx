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
  hidePrices?: boolean;
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
  hidePrices = false,
}: Props) {
  const productOf = (product_id: string) =>
    products.find((p) => p.id === product_id);

  return (
    <div className="rounded-xl bg-white shadow-md">
      <div className="border-pattern-200 flex items-center justify-between border-b p-3">
        <div className="font-semibold">Itens do pedido</div>

        {!hidePrices && (
          <Button
            onClick={onAddItem}
            type="button"
            className="bg-darker hover:bg-pattern-700 font-bold! shadow-sm"
          >
            <PlusIcon size={16} /> Adicionar item
          </Button>
        )}
      </div>

      {!items.length && (
        <div className="text-pattern-400 p-4 text-sm">
          Nenhum item adicionado.
        </div>
      )}

      <ul className="divide-pattern-200 divide-y">
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
            hidePrices={hidePrices}
          />
        ))}
      </ul>

      {!hidePrices && (
        <div className="border-pattern-200 flex items-center justify-between border-t p-4">
          <div className="text-pattern-400 text-sm">Total</div>
          <div className="text-lg font-bold">{brazilianCurrency(total)}</div>
        </div>
      )}
    </div>
  );
}
