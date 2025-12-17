import type { SupabaseClient } from "@supabase/supabase-js";

import type { SortField } from "@/types/SortField";
import type { OrderRow } from "@/types/OrderRow";

import { isoDay } from "./constants";

export type DashboardUserRole = "admin" | "vendedor" | "fabrica";

type OrdersQueryParams = {
  userRole: DashboardUserRole;
  orderColumn: SortField;
  ascending: boolean;
  from: number;
  to: number;
  startISO: string;
  endISO: string;
};

type SalesByDayParams = {
  userRole: DashboardUserRole;
  profileId: string;
  startISO: string;
  endISO: string;
};

type CustomersCountParams = {
  userRole: DashboardUserRole;
  profileId: string;
};

type OrdersMetricsParams = {
  userRole: DashboardUserRole;
  profileId: string;
  startISO: string;
  endISO: string;
};

export async function fetchUserRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ role: DashboardUserRole; profileId: string } | { error: string }> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return {
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  return {
    role: profile.role as DashboardUserRole,
    profileId: profile.id,
  };
}

export async function fetchOrders(
  supabase: SupabaseClient,
  {
    userRole,
    orderColumn,
    ascending,
    from,
    to,
    startISO,
    endISO,
  }: OrdersQueryParams,
): Promise<{ orders: OrderRow[]; totalItems: number } | { error: string }> {
  const since = new Date(`${startISO}T00:00:00.000Z`);
  const until = new Date(`${endISO}T23:59:59.999Z`);

  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot, created_at, status, total_price, customer_id, seller_id",
      { count: "exact" },
    )
    .gte("created_at", since.toISOString())
    .lte("created_at", until.toISOString());

  if (userRole === "fabrica") {
    ordersQuery = ordersQuery.eq("status", "APROVADO");
  }

  ordersQuery = ordersQuery.order(orderColumn, { ascending }).range(from, to);

  const { data: orders, error, count } = await ordersQuery;

  if (error) {
    return { error: error.message };
  }

  return { orders: orders ?? [], totalItems: count ?? 0 };
}

export async function fetchSalesByDay(
  supabase: SupabaseClient,
  { userRole, profileId, startISO, endISO }: SalesByDayParams,
): Promise<
  { salesByDay: { day: string; total: number }[] } | { error: string }
> {
  const since = new Date(`${startISO}T00:00:00.000Z`);
  const until = new Date(`${endISO}T23:59:59.999Z`);

  let chartQuery = supabase
    .from("orders")
    .select("created_at, total_price, seller_id")
    .gte("created_at", since.toISOString())
    .lte("created_at", until.toISOString())
    .order("created_at", { ascending: true });

  if (userRole === "vendedor") {
    chartQuery = chartQuery.eq("seller_id", profileId);
  }

  const { data: chartOrders, error: chartError } = await chartQuery;

  if (chartError) {
    return { error: chartError.message };
  }

  const map = new Map<string, number>();
  for (const o of chartOrders ?? []) {
    const day = isoDay(new Date(o.created_at));
    map.set(day, (map.get(day) ?? 0) + Number(o.total_price || 0));
  }

  const days: { day: string; total: number }[] = [];
  const cursor = new Date(since);
  cursor.setUTCHours(0, 0, 0, 0);

  const endCursor = new Date(until);
  endCursor.setUTCHours(0, 0, 0, 0);

  while (cursor <= endCursor) {
    const key = isoDay(cursor);
    days.push({ day: key, total: map.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return { salesByDay: days };
}

export async function fetchCustomersCount(
  supabase: SupabaseClient,
  { userRole, profileId }: CustomersCountParams,
): Promise<{ customersCount: number } | { error: string }> {
  if (userRole === "admin") {
    const { data: customers, error } = await supabase
      .from("customers")
      .select("id");

    if (error) {
      return { error: error.message };
    }

    return { customersCount: customers?.length ?? 0 };
  }

  if (userRole === "vendedor") {
    const { count, error } = await supabase
      .from("orders")
      .select("customer_id", { count: "exact", head: true })
      .eq("seller_id", profileId);

    if (error) {
      return { error: error.message };
    }

    return { customersCount: count ?? 0 };
  }

  return { customersCount: 0 };
}

export async function fetchOrdersMetrics(
  supabase: SupabaseClient,
  { userRole, profileId, startISO, endISO }: OrdersMetricsParams,
): Promise<
  | {
      totalOrdersPrice: number;
      ordersInProduction: number;
      ordersReadyToProduce: number;
    }
  | { error: string }
> {
  const since = new Date(`${startISO}T00:00:00.000Z`);
  const until = new Date(`${endISO}T23:59:59.999Z`);

  let metricsQuery = supabase
    .from("orders")
    .select("status, total_price, seller_id")
    .gte("created_at", since.toISOString())
    .lte("created_at", until.toISOString());

  if (userRole === "fabrica") {
    metricsQuery = metricsQuery.eq("status", "APROVADO");
  }

  if (userRole === "vendedor") {
    metricsQuery = metricsQuery.eq("seller_id", profileId);
  }

  const { data, error } = await metricsQuery;

  if (error) {
    return { error: error.message };
  }

  const orders = data ?? [];
  let totalOrdersPrice = 0;
  let ordersInProduction = 0;
  let ordersReadyToProduce = 0;

  for (const order of orders) {
    totalOrdersPrice += Number(order.total_price || 0);
    if (order.status === "FABRICACAO") ordersInProduction += 1;
    if (order.status === "APROVADO") ordersReadyToProduce += 1;
  }

  return {
    totalOrdersPrice,
    ordersInProduction,
    ordersReadyToProduce,
  };
}
