import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import ProfilePageClient from "./ProfilePageClient";

export default async function ProfilePage() {
  const { user } = await requireRole(["admin", "vendedor", "fabrica"]);
  const supabase = await supabaseRSC();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, role, email, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm text-red-700">
          Erro ao carregar perfil. Contate o administrador.
        </p>
      </div>
    );
  }

  const [ordersCountRes, customersCountRes, ordersTotalsRes] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id),

      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("created_by", user.id),

      supabase
        .from("orders")
        .select("total_price")
        .eq("seller_id", user.id)
        .limit(2000),
    ]);

  const ordersCount = ordersCountRes.count ?? 0;
  const customersCount = customersCountRes.count ?? 0;

  const totalSales =
    (ordersTotalsRes.data ?? []).reduce(
      (acc, o) => acc + Number(o.total_price || 0),
      0,
    ) ?? 0;

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
        id, number, status, total_price, created_at, customer_name_snapshot,
        customer:customers (id, name),
        items:order_items (id, quantity, product:products (id, name))
      `,
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <>
      <h1 className="text-2xl font-bold">Meu perfil</h1>

      <ProfilePageClient
        profile={{
          id: profile.id,
          name: profile.name,
          role: profile.role,
          email: profile.email,
          created_at: profile.created_at,
        }}
        sales={{
          ordersCount,
          customersCount,
          totalSales,
          orders: orders ?? [],
        }}
      />
    </>
  );
}
