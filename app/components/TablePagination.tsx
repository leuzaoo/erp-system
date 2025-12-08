"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

type TablePaginationProps = {
  totalItems: number;
  perPage: number;
  currentPage: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

export default function TablePagination({
  totalItems,
  perPage,
  currentPage,
  basePath,
  searchParams,
}: TablePaginationProps) {
  if (totalItems <= perPage) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const start = (safePage - 1) * perPage + 1;
  const end = Math.min(totalItems, safePage * perPage);

  const buildHref = (page: number) => {
    const params = new URLSearchParams();

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value != null && value !== "" && key !== "page") {
          params.set(key, String(value));
        }
      });
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const prevDisabled = safePage <= 1;
  const nextDisabled = safePage >= totalPages;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-neutral-600">
      <div>
        Mostrando{" "}
        <span className="font-semibold">
          {start}–{end}
        </span>{" "}
        de <span className="font-semibold">{totalItems}</span> registros
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={prevDisabled ? "#" : buildHref(safePage - 1)}
          aria-disabled={prevDisabled}
          className={clsx(
            "inline-flex items-center gap-1 rounded-md border px-2 py-1",
            "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
            "transition",
            prevDisabled &&
              "cursor-not-allowed opacity-40 hover:bg-white hover:text-neutral-700",
          )}
        >
          <ArrowLeftIcon size={14} />
          Anterior
        </Link>

        <span className="text-neutral-500 tabular-nums">
          Página <span className="font-semibold">{safePage}</span> de{" "}
          <span className="font-semibold">{totalPages}</span>
        </span>

        <Link
          href={nextDisabled ? "#" : buildHref(safePage + 1)}
          aria-disabled={nextDisabled}
          className={clsx(
            "inline-flex items-center gap-1 rounded-md border px-2 py-1",
            "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
            "transition",
            nextDisabled &&
              "cursor-not-allowed opacity-40 hover:bg-white hover:text-neutral-700",
          )}
        >
          Próxima
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </div>
  );
}
