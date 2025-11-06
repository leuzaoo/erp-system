export type Product = {
  id: string;
  name: string;
  price: number;
  max_length_cm: number | null;
  max_width_cm: number | null;
  max_height_cm: number | null;
  active?: boolean | null;
};
