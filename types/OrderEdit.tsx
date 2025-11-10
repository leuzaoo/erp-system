export type OrderEdit = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  asked_length_cm: number | null;
  asked_width_cm: number | null;
  asked_height_cm: number | null;
};
