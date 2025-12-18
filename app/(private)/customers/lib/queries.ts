import type { SupabaseClient } from "@supabase/supabase-js";

import type { CustomerListRow } from "@/types/CustomerListRow";

export async function fetchCustomersList(
  supabase: SupabaseClient,
): Promise<{ customers: CustomerListRow[] } | { error: string }> {
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, document, postal_code, state, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { customers: (customers ?? []) as CustomerListRow[] };
}

export async function fetchCustomersCount(
  supabase: SupabaseClient,
): Promise<{ customersCount: number } | { error: string }> {
  const { count, error } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true });

  if (error) {
    return { error: error.message };
  }

  return { customersCount: count ?? 0 };
}
