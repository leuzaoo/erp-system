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
  startISO: string;
  endISO: string;
};

type OrdersMetricsParams = {
  userRole: DashboardUserRole;
  profileId: string;
  startISO: string;
  endISO: string;
};

type RankingsParams = {
  userRole: DashboardUserRole;
  startISO: string;
  endISO: string;
};

export type OrdersCountRankingItem = {
  sellerId: string;
  sellerName: string;
  ordersCount: number;
};

export type OrdersValueRankingItem = {
  sellerId: string;
  sellerName: string;
  totalValue: number;
};

export type CustomersRankingItem = {
  sellerId: string;
  sellerName: string;
  customersCount: number;
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
  { userRole, profileId, startISO, endISO }: CustomersCountParams,
): Promise<{ customersCount: number } | { error: string }> {
  const since = new Date(`${startISO}T00:00:00.000Z`);
  const until = new Date(`${endISO}T23:59:59.999Z`);

  if (userRole === "fabrica") {
    return { customersCount: 0 };
  }

  let query = supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since.toISOString())
    .lte("created_at", until.toISOString());

  if (userRole === "vendedor") {
    query = query.eq("created_by", profileId);
  }

  const { count, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { customersCount: count ?? 0 };
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

export async function fetchRankings(
  supabase: SupabaseClient,
  { userRole, startISO, endISO }: RankingsParams,
): Promise<
  | {
      ordersByCount: OrdersCountRankingItem[];
      ordersByValue: OrdersValueRankingItem[];
      customersByCount: CustomersRankingItem[];
    }
  | { error: string }
> {
  if (userRole === "fabrica") {
    return { ordersByCount: [], ordersByValue: [], customersByCount: [] };
  }

  const since = new Date(`${startISO}T00:00:00.000Z`);
  const until = new Date(`${endISO}T23:59:59.999Z`);

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("seller_id, seller_name_snapshot, total_price, created_at")
    .gte("created_at", since.toISOString())
    .lte("created_at", until.toISOString());

  if (ordersError) {
    return { error: ordersError.message };
  }

  const ordersMap = new Map<
    string,
    {
      sellerId: string;
      sellerName: string;
      ordersCount: number;
      totalValue: number;
    }
  >();

  for (const order of orders ?? []) {
    if (!order.seller_id) continue;

    const sellerId = String(order.seller_id);
    const sellerName = order.seller_name_snapshot ?? "Sem vendedor";
    const current = ordersMap.get(sellerId) ?? {
      sellerId,
      sellerName,
      ordersCount: 0,
      totalValue: 0,
    };

    current.ordersCount += 1;
    current.totalValue += Number(order.total_price || 0);
    ordersMap.set(sellerId, current);
  }

  const ordersByCount = Array.from(ordersMap.values())
    .sort((a, b) => b.ordersCount - a.ordersCount)
    .slice(0, 5)
    .map((item) => ({
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      ordersCount: item.ordersCount,
    }));

  const ordersByValue = Array.from(ordersMap.values())
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5)
    .map((item) => ({
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      totalValue: item.totalValue,
    }));

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select(
      `
      created_by,
      creator:profiles!customers_created_by_fkey (
        id,
        name
      )
    `,
    )
    .gte("created_at", since.toISOString())
    .lte("created_at", until.toISOString());

  if (customersError) {
    return { error: customersError.message };
  }

  const customersMap = new Map<string, CustomersRankingItem>();

  for (const customer of customers ?? []) {
    if (!customer.created_by) continue;

    const sellerId = String(customer.created_by);
    const sellerName = customer.creator?.name ?? "Sem vendedor";
    const current = customersMap.get(sellerId) ?? {
      sellerId,
      sellerName,
      customersCount: 0,
    };

    current.customersCount += 1;
    customersMap.set(sellerId, current);
  }

  const customersByCount = Array.from(customersMap.values())
    .sort((a, b) => b.customersCount - a.customersCount)
    .slice(0, 5);

  return { ordersByCount, ordersByValue, customersByCount };
}
