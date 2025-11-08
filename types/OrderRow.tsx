export type OrderRow = {
  id: string;
  number: string | null;
  created_at: string;
  status: string;
  total_price: number | string;
  customer_id: string;
  customer_name_snapshot: string | null;
  seller_name_snapshot: string | null;
  seller_id: string;
};
