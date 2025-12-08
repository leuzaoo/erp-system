export const dynamic = "force-dynamic";

import {
  ArrowDownAZIcon,
  ArrowDownUpIcon,
  ArrowDownZAIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";

import { ProductHandleActions } from "@/app/actions/product-handle-actions";

import { brazilianCurrency } from "@/utils/brazilianCurrency";
import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import { DataTable, type Column } from "@/app/components/Table";
import TablePagination from "@/app/components/TablePagination";
import KpiCard from "@/app/components/KpiCard";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type Product = {
  id: string;
  name: string;
  price: number | string;
  active: boolean;
  max_length_cm: number | null;
  max_width_cm: number | null;
  max_height_cm: number | null;
  created_at: string;
};

type ProductSortField = "name" | "active";

type ProductsSearchParams = {
  q?: string;
  sort?: ProductSortField;
  dir?: "asc" | "desc";
  page?: string;
};

const PER_PAGE = 15;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const {
    q: qParam = "",
    sort: sortParam,
    dir: dirParam,
    page: pageParam,
  } = await searchParams;
  const rawQ = qParam.trim();

  const sortField: ProductSortField | undefined =
    sortParam === "name" || sortParam === "active" ? sortParam : undefined;

  const sortDir: "asc" | "desc" =
    dirParam === "desc" || dirParam === "asc" ? dirParam : "asc";

  await requireRole(["admin"]);

  const supabase = await supabaseRSC();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, price, active, max_length_cm, max_width_cm, max_height_cm, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <pre className="text-red-400">Erro: {error.message}</pre>;
  }

  const [totalRes, activeRes, inactiveRes] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("active", false),
  ]);

  const total = totalRes.count ?? 0;
  const active = activeRes.count ?? 0;
  const inactive = inactiveRes.count ?? 0;

  const normalize = (value: string | null | undefined): string =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  let filtered: Product[] = products ?? [];

  if (rawQ) {
    const q = normalize(rawQ.replace(/^#/, ""));

    filtered = filtered.filter((p) => {
      const name = normalize(p.name);
      const idFull = normalize(p.id);
      const idShort = normalize(p.id.slice(0, 5));

      return name.includes(q) || idFull.includes(q) || idShort.includes(q);
    });
  }

  if (sortField === "name") {
    filtered = [...filtered].sort((a, b) => {
      const na = normalize(a.name);
      const nb = normalize(b.name);
      const base = na.localeCompare(nb, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });
      return sortDir === "asc" ? base : -base;
    });
  } else if (sortField === "active") {
    filtered = [...filtered].sort((a, b) => {
      const av = a.active ? 1 : 0;
      const bv = b.active ? 1 : 0;
      const base = av - bv;
      return sortDir === "asc" ? base : -base;
    });
  }

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageProducts = filtered.slice(start, start + PER_PAGE);

  const buildSortHref = (field: ProductSortField) => {
    const isCurrent = sortField === field;
    const nextDir: "asc" | "desc" = !isCurrent
      ? "asc"
      : sortDir === "asc"
        ? "desc"
        : "asc";

    const params = new URLSearchParams();
    if (rawQ) params.set("q", rawQ);
    params.set("sort", field);
    params.set("dir", nextDir);

    return `/products?${params.toString()}`;
  };

  const isNameSorted = sortField === "name";
  const isActiveSorted = sortField === "active";

  const columns: Column<Product>[] = [
    {
      header: (
        <Link
          href={buildSortHref("name")}
          className="hover:bg-pattern-100 flex max-w-max items-center gap-1 rounded-md px-2"
        >
          <span className="flex items-center gap-1">
            <span>Nome</span>
            {!isNameSorted ? (
              <ArrowDownUpIcon size={16} />
            ) : sortDir === "asc" ? (
              <ArrowDownAZIcon size={16} />
            ) : (
              <ArrowDownZAIcon size={16} />
            )}
          </span>
        </Link>
      ),
      accessorKey: "name",
    },
    {
      header: "Dimensões (C × L × A)",
      align: "left",
      accessorFn: (row) => row,
      cell: (_, row) => {
        const p = row as Product;
        return (
          <>
            {[
              p.max_length_cm ?? "-",
              p.max_width_cm ?? "-",
              p.max_height_cm ?? "-",
            ].join(" × ")}{" "}
            cm
          </>
        );
      },
    },
    {
      header: "Valor",
      accessorKey: "price",
      align: "left",
      cell: (value) => (
        <span className="font-semibold">
          {brazilianCurrency(value as number | string)}
        </span>
      ),
    },
    {
      header: (
        <Link
          href={buildSortHref("active")}
          className="hover:bg-pattern-100 flex max-w-max items-center gap-1 rounded-md px-2"
        >
          <span className="flex items-center gap-1">
            <span>Status</span>
            {!isActiveSorted ? (
              <ArrowDownUpIcon size={16} />
            ) : sortDir === "asc" ? (
              <ArrowDownZAIcon size={16} />
            ) : (
              <ArrowDownAZIcon size={16} />
            )}
          </span>
        </Link>
      ),
      accessorKey: "active",
      cell: (value) => {
        const isActive = Boolean(value);
        return (
          <span
            className={
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs " +
              (isActive
                ? "border border-green-800 bg-green-600/20 text-green-800"
                : "border border-red-800 bg-red-600/20 text-red-800")
            }
          >
            {isActive ? "Ativo" : "Inativo"}
          </span>
        );
      },
    },
    {
      header: "",
      align: "right",
      cell: (_, row) => {
        const p = row as Product;
        return <ProductHandleActions id={p.id} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>

        <Link
          href="/products/new"
          className="bg-darker text-lighter hover:bg-pattern-700 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
        >
          <PlusIcon size={16} />
          Novo produto
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Total de produtos" value={total} />
        <KpiCard title="Ativos" value={active} />
        <KpiCard title="Inativos" value={inactive} />
      </div>

      <form className="flex max-w-lg gap-2" action="/products" method="get">
        <Input
          type="text"
          name="q"
          defaultValue={rawQ}
          placeholder="Busque por nome ou código do produto…"
        />
        <Button
          type="submit"
          className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
        >
          <SearchIcon size={16} />
          Pesquisar
        </Button>
      </form>

      <DataTable<Product>
        columns={columns}
        data={pageProducts}
        rowKey={(p) => p.id}
        emptyMessage="Nenhum produto encontrado."
        zebra
        stickyHeader
        caption={
          rawQ ? (
            <>
              Resultados para: “<span className="font-bold">{rawQ}</span>”.
            </>
          ) : undefined
        }
      />

      <TablePagination
        totalItems={totalItems}
        perPage={PER_PAGE}
        currentPage={safePage}
        basePath="/products"
        searchParams={{
          q: rawQ || undefined,
          sort: sortField,
          dir: sortField ? sortDir : undefined,
        }}
      />
    </div>
  );
}
