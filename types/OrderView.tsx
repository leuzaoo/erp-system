import type { OrderItemRow } from "./OrderItemRow";

export type OrderView = {
  id: string;
  number: string | null;
  status: string;
  total_price: number | string;
  created_at: string;
  updated_at: string | null;
  items: OrderItemRow[];
};
