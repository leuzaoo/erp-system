export type SalesTableRow = {
  id: string;
  number: string | null;
  customer_name_snapshot: string | null;
  seller_name_snapshot: string | null;
  total_price: number | string;
  status: string;
  created_at: string;
};
