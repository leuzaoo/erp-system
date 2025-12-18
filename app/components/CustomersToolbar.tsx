"use client";

import { PlusIcon, SearchIcon, XIcon } from "lucide-react";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onApplyQuery: () => void;
  onToggleNewCustomer: () => void;
};

export default function CustomersToolbar({
  query,
  onQueryChange,
  onApplyQuery,
  onToggleNewCustomer,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex max-w-lg flex-1 items-center gap-2">
        <div className="relative w-full">
          <Input
            name="q"
            type="text"
            placeholder="Nome ou documento do cliente"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onApplyQuery();
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                onApplyQuery();
              }}
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
            onApplyQuery();
          }}
        >
          <SearchIcon size={16} />
          Pesquisar
        </Button>
      </div>

      <Button
        type="button"
        onClick={onToggleNewCustomer}
        className="flex items-center gap-2 border border-blue-500"
      >
        <PlusIcon size={16} />
        Novo cliente
      </Button>
    </div>
  );
}
