"use server";

import { supabaseServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type NewCustomerInput = {
  name: string;
  document?: string;
  phone: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement?: string;
  postal_code: string;
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

  const required = [
    "name",
    "phone",
    "state",
    "city",
    "district",
    "street",
    "number",
    "postal_code",
  ];

  for (const field of required) {
    if (!payload[field as keyof NewCustomerInput]) {
      return {
        ok: false,
        message: `O campo "${field}" é obrigatório.`,
      };
    }
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: payload.name,
      document: payload.document || null,
      phone: payload.phone,
      state: payload.state,
      city: payload.city,
      district: payload.district,
      street: payload.street,
      number: payload.number,
      complement: payload.complement || null,
      postal_code: payload.postal_code,
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
