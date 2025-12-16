import type { SearchParams } from "@/types/SearchParams";
import type { SortField } from "@/types/SortField";

import { PER_PAGE, isoDay } from "./constants";

export type DashboardSearchParams = SearchParams & {
  range?: string;
  start?: string;
  end?: string;
};

export type ResolvedDashboardParams = {
  sortField?: SortField;
  sortDir: "asc" | "desc";
  orderColumn: SortField;
  ascending: boolean;
  currentPage: number;
  from: number;
  to: number;
  range: string;
  startISO: string;
  endISO: string;
  rawRange?: string;
  rawStart?: string;
  rawEnd?: string;
};

export function parseDashboardParams(
  params: DashboardSearchParams,
): ResolvedDashboardParams {
  const {
    sort: sortParam,
    dir: dirParam,
    page: pageParam,

    range: rangeParam,
    start: startParam,
    end: endParam,
  } = params;

  const sortField: SortField | undefined =
    sortParam === "status" || sortParam === "created_at"
      ? sortParam
      : undefined;

  const sortDir: "asc" | "desc" =
    dirParam === "desc" || dirParam === "asc" ? dirParam : "asc";

  const currentPage = Math.max(1, Number(pageParam) || 1);
  const from = (currentPage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

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

  const orderColumn: SortField = sortField ?? "created_at";
  const ascending = sortField === undefined ? false : sortDir === "asc";

  return {
    sortField,
    sortDir,
    orderColumn,
    ascending,
    currentPage,
    from,
    to,
    range,
    startISO,
    endISO,
    rawRange: rangeParam,
    rawStart: startParam,
    rawEnd: endParam,
  };
}
