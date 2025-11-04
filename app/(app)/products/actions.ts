"use server";

import { supabaseAction } from "@/utils/supabase/action";
import { redirect } from "next/navigation";

function num(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function bool(v: FormDataEntryValue | null): boolean {
  return String(v) === "on" || String(v) === "true" || String(v) === "1";
}

export async function createProduct(formData: FormData) {
  const supabase = await supabaseAction();

  const name = String(formData.get("name") || "").trim();
  const price = num(formData.get("price"));
  const active = bool(formData.get("active"));
  const max_length_cm = num(formData.get("max_length_cm"));
  const max_width_cm = num(formData.get("max_width_cm"));
  const max_height_cm = num(formData.get("max_height_cm"));

  if (!name || price === null) {
    throw new Error("Nome e preço são obrigatórios.");
  }

  const { error } = await supabase.from("products").insert({
    name,
    price,
    active,
    max_length_cm,
    max_width_cm,
    max_height_cm,
  });

  if (error) throw new Error(error.message);

  redirect("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await supabaseAction();

  const name = String(formData.get("name") || "").trim();
  const price = num(formData.get("price"));
  const active = bool(formData.get("active"));
  const max_length_cm = num(formData.get("max_length_cm"));
  const max_width_cm = num(formData.get("max_width_cm"));
  const max_height_cm = num(formData.get("max_height_cm"));

  if (!name || price === null) {
    throw new Error("Nome e preço são obrigatórios.");
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      price,
      active,
      max_length_cm,
      max_width_cm,
      max_height_cm,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  redirect(`/products/${id}`);
}

export async function deleteProduct(id: string) {
  const supabase = await supabaseAction();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/products");
}
