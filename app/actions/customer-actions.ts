"use server";

import { supabaseServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type NewCustomerInput = {
  name: string;
  document?: string;
  phone?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  number?: string;
  complement?: string;
  postal_code?: string;
};

export async function createCustomerAction(payload: NewCustomerInput): Promise<{
  ok: boolean;
  message?: string;
  customer?: { id: string; name: string };
}> {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return { ok: false, message: "Usuário não autenticado." };
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: payload.name,
      document: payload.document || null,
      phone: payload.phone || null,
      state: payload.state || null,
      city: payload.city || null,
      district: payload.district || null,
      street: payload.street || null,
      number: payload.number || null,
      complement: payload.complement || null,
      postal_code: payload.postal_code || null,
      created_by: user.id,
    })
    .select("id, name")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/sales/new-sale");

  return { ok: true, customer: { id: data.id, name: data.name } };
}
