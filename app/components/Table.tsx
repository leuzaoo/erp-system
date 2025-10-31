import * as React from "react";
import clsx from "clsx";

export type Column<T> = {
  header: React.ReactNode;
  accessorKey?: keyof T & string;
  accessorFn?: (row: T) => unknown;
  cell?: (value: unknown, row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string | number;
  className?: string;
  headerClassName?: string;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[] | null | undefined;
  rowKey: (row: T, index: number) => React.Key;
  caption?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  zebra?: boolean;
  dense?: boolean;
  stickyHeader?: boolean;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  caption,
  emptyMessage = "Sem registros.",
  zebra = true,
  dense = false,
  stickyHeader = true,
  className,
}: DataTableProps<T>) {
  const pad = dense ? "py-2 px-3" : "py-3 px-4";

  return (
    <div
      className={clsx(
        "overflow-x-auto rounded-lg border border-neutral-800",
        className,
      )}
    >
      <table className="w-full border-collapse">
        {caption && (
          <caption className="p-3 text-left text-sm text-neutral-400">
            {caption}
          </caption>
        )}

        <thead
          className={clsx(
            "bg-neutral-900/60 text-sm text-neutral-300",
            stickyHeader && "sticky top-0 z-10",
          )}
        >
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                style={{ width: c.width }}
                className={clsx(
                  pad,
                  "border-b border-neutral-800 text-left font-medium",
                  c.align === "center" && "text-center",
                  c.align === "right" && "text-right",
                  c.headerClassName,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {!data?.length && (
            <tr>
              <td
                className={clsx(pad, "text-neutral-400")}
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {data?.map((row, idx) => (
            <tr
              key={rowKey(row, idx)}
              className={clsx(
                "text-sm transition",
                zebra && idx % 2 === 1 ? "bg-neutral-900/30" : "bg-transparent",
                "hover:bg-neutral-900/50",
              )}
            >
              {columns.map((c, ci) => {
                const raw = c.accessorFn
                  ? c.accessorFn(row)
                  : c.accessorKey
                    ? row[c.accessorKey]
                    : undefined;

                return (
                  <td
                    key={ci}
                    className={clsx(
                      pad,
                      "border-b border-neutral-900",
                      c.align === "center" && "text-center",
                      c.align === "right" && "text-right",
                      c.className,
                    )}
                  >
                    {c.cell ? c.cell(raw, row) : (raw as React.ReactNode)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
