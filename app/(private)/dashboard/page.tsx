import Link from "next/link";
import {
  ArrowDown01Icon,
  ArrowDown10Icon,
  ArrowDownAZIcon,
  ArrowDownUpIcon,
  ArrowDownZAIcon,
} from "lucide-react";

import type { SearchParams } from "@/types/SearchParams";
import type { SortField } from "@/types/SortField";
import type { OrderRow } from "@/types/OrderRow";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { requireAuth } from "@/utils/auth/requireAuth";
import { supabaseRSC } from "@/utils/supabase/rsc";
import { createdAt } from "@/utils/createdAt";
import { shortId } from "@/utils/shortId";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGE_CLASS,
} from "@/utils/orderStatus";

import SalesByDayChart from "@/app/components/charts/SalesByDayChart";
import { DataTable, type Column } from "@/app/components/Table";
import TablePagination from "@/app/components/TablePagination";
import Card from "@/app/components/Card";

function sumOrdersTotal(orders: { total_price: number }[] = []) {
  return orders.reduce((acc, order) => acc + Number(order.total_price || 0), 0);
}

function countOrdersInProduction(orders: { status: string }[] = []) {
  return orders.filter((order) => order.status === "FABRICACAO").length;
}

function countOrdersReadyToProduce(orders: { status: string }[] = []) {
  return orders.filter((order) => order.status === "APROVADO").length;
}

const PER_PAGE = 15;

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<
    SearchParams & { range?: string; start?: string; end?: string }
  >;
}) {
  const {
    sort: sortParam,
    dir: dirParam,
    page: pageParam,

    range: rangeParam,
    start: startParam,
    end: endParam,
  } = await searchParams;

  const sortField: SortField | undefined =
    sortParam === "status" || sortParam === "created_at"
      ? sortParam
      : undefined;

  const sortDir: "asc" | "desc" =
    dirParam === "desc" || dirParam === "asc" ? dirParam : "asc";

  const currentPage = Math.max(1, Number(pageParam) || 1);
  const from = (currentPage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const user = await requireAuth();
  const supabase = await supabaseRSC();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <pre className="text-red-600">
        Erro ao carregar perfil: {profileError?.message}
      </pre>
    );
  }

  const userRole = profile.role as "admin" | "vendedor" | "fabrica";

  const orderColumn: SortField = sortField ?? "created_at";
  const ascending = sortField === undefined ? false : sortDir === "asc";

  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot, created_at, status, total_price, customer_id, seller_id",
      { count: "exact" },
    );

  if (userRole === "fabrica") {
    ordersQuery = ordersQuery.eq("status", "APROVADO");
  }

  ordersQuery = ordersQuery.order(orderColumn, { ascending }).range(from, to);

  const { data: orders, error, count } = await ordersQuery;

  if (error) {
    return <pre className="text-red-600">Erro: {error.message}</pre>;
  }

  const totalItems = count ?? 0;
  const pageOrders = orders ?? [];

  let salesByDay: { day: string; total: number }[] = [];

  const range = rangeParam ?? "14";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startISO = startParam ?? "";
  let endISO = endParam ?? "";

  if (!startISO || !endISO) {
    const days = range !== "custom" ? Number(range) : 14;
    const safeDays = Number.isFinite(days) && days > 0 ? days : 14;

    const since = new Date(today);
    since.setDate(since.getDate() - (safeDays - 1));

    startISO = isoDay(since);
    endISO = isoDay(today);
  }

  const canSeeChart = userRole === "admin" || userRole === "vendedor";

  if (canSeeChart) {
    const since = new Date(`${startISO}T00:00:00.000Z`);
    const until = new Date(`${endISO}T23:59:59.999Z`);

    let chartQuery = supabase
      .from("orders")
      .select("created_at, total_price, seller_id")
      .gte("created_at", since.toISOString())
      .lte("created_at", until.toISOString())
      .order("created_at", { ascending: true });

    if (userRole === "vendedor") {
      chartQuery = chartQuery.eq("seller_id", profile.id);
    }

    const { data: chartOrders, error: chartError } = await chartQuery;

    if (chartError) {
      return <pre className="text-red-600">Erro: {chartError.message}</pre>;
    }

    const map = new Map<string, number>();
    for (const o of chartOrders ?? []) {
      const dt = new Date(o.created_at);
      const day = dt.toISOString().slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + Number(o.total_price || 0));
    }

    const days: { day: string; total: number }[] = [];
    const cursor = new Date(since);
    cursor.setUTCHours(0, 0, 0, 0);

    const endCursor = new Date(until);
    endCursor.setUTCHours(0, 0, 0, 0);

    while (cursor <= endCursor) {
      const key = cursor.toISOString().slice(0, 10);
      days.push({ day: key, total: map.get(key) ?? 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    salesByDay = days;
  }

  const totalOrdersPrice = sumOrdersTotal(pageOrders);
  const ordersInProduction = countOrdersInProduction(pageOrders);
  const ordersReadyToProduce = countOrdersReadyToProduce(pageOrders);

  let customersCount = 0;

  if (userRole === "admin") {
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id");

    if (customersError) {
      return (
        <pre className="text-red-600">
          Erro ao renderizar clientes: {customersError.message}
        </pre>
      );
    }

    customersCount = customers?.length ?? 0;
  } else if (userRole === "vendedor") {
    const { count: customersCountRes, error: customersError } = await supabase
      .from("orders")
      .select("customer_id", { count: "exact", head: true })
      .eq("seller_id", profile.id);

    if (customersError) {
      return (
        <pre className="text-red-600">
          Erro ao renderizar clientes: {customersError.message}
        </pre>
      );
    }

    customersCount = customersCountRes ?? 0;
  }

  const buildSortHref = (field: SortField) => {
    const isCurrent = sortField === field;
    const nextDir: "asc" | "desc" = !isCurrent
      ? "asc"
      : sortDir === "asc"
        ? "desc"
        : "asc";

    const params = new URLSearchParams();
    params.set("sort", field);
    params.set("dir", nextDir);

    if (rangeParam) params.set("range", rangeParam);
    if (startParam) params.set("start", startParam);
    if (endParam) params.set("end", endParam);

    const qs = params.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  const isStatusSorted = sortField === "status";
  const isCreatedSorted = sortField === "created_at";

  const columns: Column<OrderRow>[] = [
    {
      header: "Pedido",
      cell: (_, row) => (
        <Link href={`/orders/${row.id}`} className="font-bold hover:underline">
          {shortId(row.id)}
        </Link>
      ),
    },
    {
      header: "Cliente",
      cell: (_, row) => <span>{row.customer_name_snapshot}</span>,
    },
    {
      header: "Vendedor",
      cell: (_, row) => <span>{row.seller_name_snapshot}</span>,
    },
    {
      header: (
        <Link
          href={buildSortHref("status")}
          className="hover:bg-pattern-100 flex max-w-max items-center gap-1 rounded-md px-2"
        >
          <span className="flex items-center gap-1">
            <span>Status</span>
            {!isStatusSorted ? (
              <ArrowDownUpIcon size={16} />
            ) : sortDir === "asc" ? (
              <ArrowDownAZIcon size={16} />
            ) : (
              <ArrowDownZAIcon size={16} />
            )}
          </span>
        </Link>
      ),
      cell: (_, row) => (
        <span
          className={
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
            (ORDER_STATUS_BADGE_CLASS[row.status] ??
              "border border-neutral-700")
          }
        >
          {ORDER_STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
    {
      header: "Valor",
      align: "right",
      cell: (_, row) => brazilianCurrency(row.total_price),
    },
    {
      header: (
        <Link
          href={buildSortHref("created_at")}
          className="hover:bg-pattern-100 ml-auto flex max-w-max items-center gap-1 rounded-md px-2"
        >
          <span className="flex items-center gap-1">
            <span>Criado</span>
            {!isCreatedSorted ? (
              <ArrowDownUpIcon size={16} />
            ) : sortDir === "asc" ? (
              <ArrowDown01Icon size={16} />
            ) : (
              <ArrowDown10Icon size={16} />
            )}
          </span>
        </Link>
      ),
      align: "right",
      cell: (_, row) => createdAt(row.created_at),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="flex items-center gap-4 overflow-x-auto">
        {userRole === "fabrica" ? (
          <Card className="flex max-w-max min-w-max flex-col gap-1">
            <span>Pronto para fabricar</span>
            <span className="text-2xl font-bold">{ordersReadyToProduce}</span>
          </Card>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto">
            <Card className="flex flex-col">
              <span>Vendas</span>
              <span className="text-2xl font-bold">
                {pageOrders.length ?? 0}
              </span>
            </Card>
            <Card className="flex flex-col">
              <span>Em fabricação</span>
              <span className="text-2xl font-bold">{ordersInProduction}</span>
            </Card>
            <Card className="flex flex-col">
              <span>Clientes cadastrados</span>
              <span className="text-2xl font-bold">{customersCount}</span>
            </Card>
            <Card className="flex min-w-max flex-col">
              <span>Total de vendas</span>
              <span className="text-2xl font-bold">
                {brazilianCurrency(totalOrdersPrice)}
              </span>
            </Card>
          </div>
        )}
      </div>

      {(userRole === "admin" || userRole === "vendedor") && (
        <SalesByDayChart
          data={salesByDay}
          initialRange={rangeParam}
          initialStart={startParam}
          initialEnd={endParam}
        />
      )}

      {!pageOrders.length && (
        <p className="text-pattern-800">Nenhum pedido encontrado.</p>
      )}

      {!!pageOrders.length && (
        <>
          <DataTable<OrderRow>
            data={pageOrders}
            rowKey={(row) => row.id}
            emptyMessage="Nenhum pedido encontrado."
            columns={columns}
          />

          <TablePagination
            totalItems={totalItems}
            perPage={PER_PAGE}
            currentPage={currentPage}
            basePath="/dashboard"
            searchParams={{
              sort: sortField,
              dir: sortField ? sortDir : undefined,

              range: rangeParam,
              start: startParam,
              end: endParam,
            }}
          />
        </>
      )}
    </div>
  );
}
