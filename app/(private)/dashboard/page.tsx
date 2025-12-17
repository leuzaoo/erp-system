import SalesByDayChart from "@/app/components/charts/SalesByDayChart";
import { requireAuth } from "@/utils/auth/requireAuth";
import { supabaseRSC } from "@/utils/supabase/rsc";

import OrdersTableSection from "./components/OrdersTableSection";
import StatsCards from "./components/StatsCards";

import { parseDashboardParams, type DashboardSearchParams } from "./lib/params";
import {
  fetchCustomersCount,
  fetchOrders,
  fetchOrdersMetrics,
  fetchSalesByDay,
  fetchUserRole,
} from "./lib/queries";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const resolvedParams = parseDashboardParams(await searchParams);

  const user = await requireAuth();
  const supabase = await supabaseRSC();

  const profileResult = await fetchUserRole(supabase, user.id);
  if ("error" in profileResult) {
    return (
      <pre className="text-red-600">
        Erro ao carregar perfil: {profileResult.error}
      </pre>
    );
  }

  const { role: userRole, profileId } = profileResult;

  const ordersResult = await fetchOrders(supabase, {
    userRole,
    orderColumn: resolvedParams.orderColumn,
    ascending: resolvedParams.ascending,
    from: resolvedParams.from,
    to: resolvedParams.to,
    startISO: resolvedParams.startISO,
    endISO: resolvedParams.endISO,
  });

  if ("error" in ordersResult) {
    return <pre className="text-red-600">Erro: {ordersResult.error}</pre>;
  }

  const pageOrders = ordersResult.orders;
  const totalItems = ordersResult.totalItems;

  const metricsResult = await fetchOrdersMetrics(supabase, {
    userRole,
    profileId,
    startISO: resolvedParams.startISO,
    endISO: resolvedParams.endISO,
  });

  if ("error" in metricsResult) {
    return (
      <pre className="text-red-600">
        Erro ao carregar métricas: {metricsResult.error}
      </pre>
    );
  }

  const {
    totalOrdersPrice,
    ordersInProduction,
    ordersReadyToProduce,
  } = metricsResult;

  const customersResult = await fetchCustomersCount(supabase, {
    userRole,
    profileId,
    startISO: resolvedParams.startISO,
    endISO: resolvedParams.endISO,
  });

  if ("error" in customersResult) {
    return (
      <pre className="text-red-600">
        Erro ao renderizar clientes: {customersResult.error}
      </pre>
    );
  }

  const customersCount = customersResult.customersCount;
  const canSeeChart = userRole === "admin" || userRole === "vendedor";

  let salesByDay: { day: string; total: number }[] = [];

  if (canSeeChart) {
    const salesResult = await fetchSalesByDay(supabase, {
      userRole,
      profileId,
      startISO: resolvedParams.startISO,
      endISO: resolvedParams.endISO,
    });

    if ("error" in salesResult) {
      return <pre className="text-red-600">Erro: {salesResult.error}</pre>;
    }

    salesByDay = salesResult.salesByDay;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <StatsCards
        userRole={userRole}
        ordersCount={totalItems}
        ordersInProduction={ordersInProduction}
        ordersReadyToProduce={ordersReadyToProduce}
        customersCount={customersCount}
        totalOrdersPrice={totalOrdersPrice}
      />

      {canSeeChart && (
        <SalesByDayChart
          data={salesByDay}
          initialRange={resolvedParams.rawRange}
          initialStart={resolvedParams.rawStart}
          initialEnd={resolvedParams.rawEnd}
        />
      )}

      {!pageOrders.length ? (
        <p className="text-pattern-800">Nenhum pedido encontrado.</p>
      ) : (
        <OrdersTableSection
          orders={pageOrders}
          totalItems={totalItems}
          currentPage={resolvedParams.currentPage}
          sortField={resolvedParams.sortField}
          sortDir={resolvedParams.sortDir}
          rangeParam={resolvedParams.rawRange}
          startParam={resolvedParams.rawStart}
          endParam={resolvedParams.rawEnd}
        />
      )}
    </div>
  );
}
