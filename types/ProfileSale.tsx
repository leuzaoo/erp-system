export type ProfileSaleItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string | null;
  } | null;
};

export type ProfileSale = {
  id: string;
  number: string | null;
  status: string;
  total_price: number | string;
  created_at: string;
  customer_name_snapshot: string | null;
  customer: {
    id: string;
    name: string | null;
  } | null;
  items: ProfileSaleItem[];
};
