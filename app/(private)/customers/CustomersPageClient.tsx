"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import type { CustomerListRow } from "@/types/CustomerListRow";
import { normalizeText } from "./lib/normalize";

import NewCustomerForm from "@/app/components/forms/NewCustomerForm";
import CustomersToolbar from "@/app/components/CustomersToolbar";
import TablePagination from "@/app/components/TablePagination";
import Card from "@/app/components/Card";
import CustomersTable, {
  type CustomerSortField,
} from "@/app/components/CustomersTable";

type Props = {
  customers: CustomerListRow[];
  totalCount: number;
  rawQ: string;
};

const PER_PAGE = 15;

export default function CustomersPageClient({
  customers,
  totalCount,
  rawQ,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showNewCustomer, setShowNewCustomer] = React.useState(false);

  const [query, setQuery] = React.useState(rawQ ?? "");

  const sortParam = searchParams.get("sort");
  const dirParam = searchParams.get("dir");
  const pageParam = searchParams.get("page");

  const sortField: CustomerSortField =
    sortParam === "name" || sortParam === "state" || sortParam === "created_at"
      ? sortParam
      : "name";
  const sortDir: "asc" | "desc" =
    dirParam === "desc" || dirParam === "asc" ? dirParam : "asc";

  const toggleNewCustomer = () => setShowNewCustomer((v) => !v);

  React.useEffect(() => {
    const qFromUrl = searchParams.get("q") ?? "";
    setQuery((prev) => (prev === qFromUrl ? prev : qFromUrl));
  }, [searchParams]);

  const applyQueryToUrl = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }
    params.delete("page");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, query, router, searchParams]);

  const handleSort = (field: CustomerSortField) => {
    const isCurrent = sortField === field;
    const nextDir: "asc" | "desc" = !isCurrent
      ? "asc"
      : sortDir === "asc"
        ? "desc"
        : "asc";

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", field);
    params.set("dir", nextDir);
    params.delete("page");

    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filteredCustomers = React.useMemo(() => {
    const term = query.trim();
    let list = [...customers];

    if (term) {
      const q = normalizeText(term);

      list = list.filter((c) => {
        const customerName = normalizeText(c.name);
        const customerDocument = normalizeText(String(c.document ?? ""));

        return customerName.includes(q) || customerDocument.includes(q);
      });
    }

    const factor = sortDir === "asc" ? 1 : -1;

    list.sort((a, b) => {
      if (sortField === "name") {
        return (
          a.name.localeCompare(b.name, "pt-BR", {
            sensitivity: "base",
          }) * factor
        );
      }

      if (sortField === "state") {
        const sa = normalizeText(String(a.state ?? ""));
        const sb = normalizeText(String(b.state ?? ""));
        return sa.localeCompare(sb, "pt-BR", { sensitivity: "base" }) * factor;
      }

      if (sortField === "created_at") {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return (da - db) * factor;
      }

      return 0;
    });

    return list;
  }, [customers, query, sortField, sortDir]);

  const trimmedQuery = query.trim();
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const queryMatchesUrl = (searchParams.get("q") ?? "") === trimmedQuery;
  const page = queryMatchesUrl ? safePage : 1;
  const start = (page - 1) * PER_PAGE;
  const pageCustomers = filteredCustomers.slice(start, start + PER_PAGE);

  return (
    <>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Clientes</h1>

        <div className="flex items-center">
          <Card className="flex max-w-max flex-col gap-1">
            Clientes cadastrados
            <span className="text-2xl font-bold">{totalCount}</span>
          </Card>
        </div>

        <CustomersToolbar
          query={query}
          onQueryChange={setQuery}
          onApplyQuery={applyQueryToUrl}
          onToggleNewCustomer={toggleNewCustomer}
        />

        <CustomersTable
          customers={pageCustomers}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          queryCaption={
            query ? (
              <>
                Resultados para: “<span className="font-bold">{query}</span>”.
              </>
            ) : undefined
          }
        />

        <TablePagination
          totalItems={totalItems}
          perPage={PER_PAGE}
          currentPage={page}
          basePath="/customers"
          searchParams={{
            q: trimmedQuery || undefined,
            sort: sortParam ?? undefined,
            dir: sortParam ? sortDir : undefined,
          }}
        />
      </div>

      {showNewCustomer && (
        <NewCustomerForm
          closeModal={toggleNewCustomer}
          onCreated={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
