import type { OrderItemRow } from "./OrderItemRow";

export type OrderView = {
  id: string;
  number: string | null;
  status: string;
  total_price: number | string;
  created_at: string;
  updated_at: string | null;

  customer_name_snapshot: string | null;
  seller_name_snapshot: string | null;

  customer: {
    id: string;
    name: string | null;
    phone?: string | null;
    document?: string | null;
    state?: string | null;
    city?: string | null;
    district?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
  } | null;

  seller: {
    id: string;
    name: string | null;
  } | null;

  items: OrderItemRow[];
};
