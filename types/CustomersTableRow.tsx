export type CustomersTableRow = {
  id: string;
  name: string;
  document: string | null;
  phone: string;
  created_by: string;
  district: string;
  street: string;
  number: string;
  complement: string | null;
  postal_code: string;
  city: string;
  state: string;
  created_at: string;
  creator?: {
    id: string;
    name: string;
  } | null;
};
