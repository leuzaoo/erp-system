export type CustomersTableRow = {
  id: string;
  name: string;
  document: string;
  phone: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  postal_code: string;
  complement?: string | null;
  created_at: string;
  creator?: {
    id: string;
    name: string;
  } | null;
};
