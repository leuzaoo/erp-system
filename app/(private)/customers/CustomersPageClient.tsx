"use client";

import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import Link from "next/link";
import moment from "moment";

import type { CustomersTableRow } from "@/types/CustomersTableRow";

import NewCustomerForm from "@/app/components/forms/NewCustomerForm";
import { DataTable, type Column } from "@/app/components/Table";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import Card from "@/app/components/Card";

type Props = {
  customers: CustomersTableRow[];
  totalCount: number;
  rawQ: string;
};

export default function CustomersPageClient({
  customers,
  totalCount,
  rawQ,
}: Props) {
  const router = useRouter();
  const [showNewCustomer, setShowNewCustomer] = React.useState(false);

  const [query, setQuery] = React.useState(rawQ ?? "");

  const toggleNewCustomer = () => setShowNewCustomer((v) => !v);

  const normalize = (value: string): string =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredCustomers = React.useMemo(() => {
    const term = query.trim();
    if (!term) return customers;

    const q = normalize(term);

    return customers.filter((c) => {
      const customerName = normalize(c.name);
      const customerDocument = normalize(c.document);

      return customerName.includes(q) || customerDocument.includes(q);
    });
  }, [customers, query]);

  const columns: Column<CustomersTableRow>[] = [
    {
      header: "Nome",
      accessorKey: "name",
      width: 600,
      cell: (value, row) => (
        <Link
          href={`/customers/${row.id}`}
          className="font-bold hover:underline"
        >
          {String(value)}
        </Link>
      ),
    },
    {
      header: "Documento",
      accessorKey: "document",
      align: "left",
      width: 200,
      cell: (value) => (value ?? "—") as string,
    },
    {
      header: "CEP",
      accessorKey: "postal_code",
      width: 200,
      cell: (value) => (value ?? "-") as string,
    },
    {
      header: "Estado",
      accessorKey: "state",
      align: "left",
      width: 200,
      cell: (value) => (value ?? "-") as string,
    },
    {
      header: "Cadastrado em",
      accessorKey: "created_at",
      align: "right",
      width: 200,
      cell: (value) => moment(String(value)).format("DD/MM/YYYY"),
    },
  ];

  const columnsWithEdit: Column<CustomersTableRow>[] = [
    ...columns,
    {
      header: "",
      align: "right",
      width: 160,
      cell: (_, row) => (
        <Link
          href={`/orders/${row.id}/edit`}
          className="rounded-md border border-neutral-400 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200"
        >
          Editar
        </Link>
      ),
    },
  ];

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

        <div className="flex items-center justify-between gap-4">
          <div className="flex max-w-lg flex-1 items-center gap-2">
            <div className="relative w-full">
              <Input
                name="q"
                type="text"
                placeholder="Nome ou documento do cliente"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-neutral-500 hover:text-neutral-800"
                  title="Limpar busca"
                >
                  <XIcon size={16} />
                </button>
              )}
            </div>

            <Button
              type="button"
              className="bg-darker! hover:bg-pattern-700! border-pattern-400! text-lighter! flex items-center gap-2 border"
              onClick={() => {
                const input =
                  document.querySelector<HTMLInputElement>('input[name="q"]');
                input?.focus();
              }}
            >
              <SearchIcon size={16} />
              Pesquisar
            </Button>
          </div>

          <Button
            type="button"
            onClick={toggleNewCustomer}
            className="flex items-center gap-2 border border-blue-500"
          >
            <PlusIcon size={16} />
            Novo cliente
          </Button>
        </div>

        <DataTable<CustomersTableRow>
          columns={columnsWithEdit}
          data={filteredCustomers}
          rowKey={(r) => r.id}
          caption={
            query ? (
              <>
                Resultados para: “<span className="font-bold">{query}</span>”.
              </>
            ) : undefined
          }
          emptyMessage="Nenhum cliente encontrado."
          zebra
          stickyHeader
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
