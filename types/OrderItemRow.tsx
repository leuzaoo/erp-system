export type OrderItemRow = {
  id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  asked_length_cm: number | null;
  asked_width_cm: number | null;
  asked_height_cm: number | null;
  product: {
    id: string;
    name: string | null;
    price: number | string;
    max_length_cm: number | null;
    max_width_cm: number | null;
    max_height_cm: number | null;
  } | null;
};
