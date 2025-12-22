"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  createOrder,
  type CreateOrderResult,
} from "@/app/actions/new-sale-actions";

import { validateDimension } from "@/utils/validateDimension";

import type { ItemErrors } from "@/types/ItemsErrors";
import type { ItemDraft } from "@/types/ItemDraft";
import type { Customer } from "@/types/Customer";
import type { Product } from "@/types/Product";

import NewCustomerForm from "@/app/components/forms/NewCustomerForm";
import ItemsSection from "@/app/components/ItemsSection";
import Button from "@/app/components/Button";
import Input from "../Input";

type Props = { customers: Customer[]; products: Product[] };

export default function NewSaleForm({ customers, products }: Props) {
  const router = useRouter();

  const [customerDropdownOpen, setCustomerDropdownOpen] = React.useState(false);
  const [customerList, setCustomerList] = React.useState(customers);
  const [customerModal, setCustomerModal] = React.useState(false);
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [customerId, setCustomerId] = React.useState("");

  const [errors, setErrors] = React.useState<Record<number, ItemErrors>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<ItemDraft[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const customerBoxRef = React.useRef<HTMLDivElement | null>(null);

  const filteredCustomers = React.useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return [];
    return customerList.filter((c) => c.name.toLowerCase().includes(term));
  }, [customerSearch, customerList]);

  React.useEffect(() => {
    if (!customerId) return;
    const selected = customerList.find((c) => c.id === customerId);
    if (selected) setCustomerSearch(selected.name);
  }, [customerId, customerList]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        customerBoxRef.current &&
        !customerBoxRef.current.contains(e.target as Node)
      ) {
        setCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCustomerModal = () => setCustomerModal((v) => !v);

  const handleCustomerCreated = (customer: { id: string; name: string }) => {
    setCustomerList((prev) => [customer, ...prev]);
    setCustomerId(customer.id);
    setCustomerSearch(customer.name);
    setCustomerDropdownOpen(false);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerSearch(customer.name);
    setCustomerDropdownOpen(false);
  };

  const handleCustomerSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setCustomerSearch(value);

    setCustomerId("");

    if (value.trim()) {
      setCustomerDropdownOpen(true);
    } else {
      setCustomerDropdownOpen(false);
    }
  };

  const productOf = (product_id: string) =>
    products.find((p) => p.id === product_id);

  const addItem = () => {
    if (!products.length) return;
    const p = products[0];
    setItems((prev) => [
      ...prev,
      {
        product_id: p.id,
        quantity: 1,
        unit_price: Number(p.price || 0),
        asked_length_cm: "",
        asked_width_cm: "",
        asked_height_cm: "",
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const updateItem = (idx: number, patch: Partial<ItemDraft>) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );

  const onChangeProduct = (idx: number, product_id: string) => {
    const p = productOf(product_id);
    const base = items[idx];
    const nextErr: ItemErrors = {
      length: validateDimension(
        "Comprimento",
        base.asked_length_cm,
        p?.max_length_cm,
      ),
      width: validateDimension("Largura", base.asked_width_cm, p?.max_width_cm),
      height: validateDimension(
        "Altura",
        base.asked_height_cm,
        p?.max_height_cm,
      ),
    };
    setErrors((prev) => ({ ...prev, [idx]: nextErr }));
    updateItem(idx, { product_id, unit_price: Number(p?.price || 0) });
  };

  const onChangeLength = (idx: number, next: number | "") => {
    const pr = productOf(items[idx].product_id);
    const msg = validateDimension("Comprimento", next, pr?.max_length_cm);
    setErrors((prev) => ({ ...prev, [idx]: { ...prev[idx], length: msg } }));
    updateItem(idx, { asked_length_cm: next });
  };

  const onChangeWidth = (idx: number, next: number | "") => {
    const pr = productOf(items[idx].product_id);
    const msg = validateDimension("Largura", next, pr?.max_width_cm);
    setErrors((prev) => ({ ...prev, [idx]: { ...prev[idx], width: msg } }));
    updateItem(idx, { asked_width_cm: next });
  };

  const onChangeHeight = (idx: number, next: number | "") => {
    const pr = productOf(items[idx].product_id);
    const msg = validateDimension("Altura", next, pr?.max_height_cm);
    setErrors((prev) => ({ ...prev, [idx]: { ...prev[idx], height: msg } }));
    updateItem(idx, { asked_height_cm: next });
  };

  const hasItemErrors = React.useMemo(
    () => Object.values(errors).some((e) => e.length || e.width || e.height),
    [errors],
  );

  const total = items.reduce(
    (acc, it) => acc + Number(it.unit_price || 0) * Number(it.quantity || 0),
    0,
  );

  const onSubmit = async () => {
    setFormError(null);

    if (!customerId) {
      setFormError("Selecione um cliente.");
      return;
    }
    if (!items.length) {
      setFormError("Adicione ao menos um item.");
      return;
    }

    const computed: Record<number, ItemErrors> = {};
    items.forEach((it, idx) => {
      const p = productOf(it.product_id);
      computed[idx] = {
        length: validateDimension(
          "Comprimento",
          it.asked_length_cm,
          p?.max_length_cm,
        ),
        width: validateDimension("Largura", it.asked_width_cm, p?.max_width_cm),
        height: validateDimension(
          "Altura",
          it.asked_height_cm,
          p?.max_height_cm,
        ),
      };
    });
    const hasComputedErrors = Object.values(computed).some(
      (e) => e.length || e.width || e.height,
    );
    if (hasComputedErrors) {
      setErrors(computed);
      setFormError(
        "Você deve preencher os campos de dimensões antes de continuar.",
      );
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Criando nova venda.");
    const payload = {
      customer_id: customerId,
      items: items.map((it) => ({
        product_id: it.product_id,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        asked_length_cm: Number(it.asked_length_cm),
        asked_width_cm: Number(it.asked_width_cm),
        asked_height_cm: Number(it.asked_height_cm),
      })),
    };

    try {
      const res: CreateOrderResult = await createOrder(payload);

      if (!res.ok) {
        const message = res.message || "Não foi possível criar a venda.";
        setFormError(message);
        toast.error(message, { id: toastId });
        return;
      }

      toast.success("Venda criada com sucesso!", { id: toastId });
      router.push(`/orders/${res.orderId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível criar a venda.";
      setFormError(message);
      toast.error(message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-10 space-y-6">
      <div className="grid gap-4">
        <div>
          <div className="flex w-full flex-col">
            <div className="flex max-w-xl items-end gap-4">
              <div ref={customerBoxRef} className="relative w-full">
                <Input
                  label="Cliente"
                  type="text"
                  value={customerSearch}
                  onChange={handleCustomerSearchChange}
                  onFocus={() => {
                    if (customerSearch.trim()) {
                      setCustomerDropdownOpen(true);
                    }
                  }}
                  placeholder="Digite o nome do cliente..."
                />

                {customerDropdownOpen && filteredCustomers.length > 0 && (
                  <ul className="divide-pattern-200 bg-pattern-100 absolute z-20 mt-1 max-h-60 w-full divide-y overflow-y-auto rounded-md border border-neutral-300 text-sm shadow-md">
                    {filteredCustomers.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectCustomer(c);
                          }}
                          className={[
                            "flex w-full items-center justify-between px-3 py-2 text-left",
                            c.id === customerId ? "bg-pattern-100" : "",
                          ]
                            .join(" ")
                            .trim()}
                        >
                          <span>{c.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button
                className="flex w-full max-w-max items-center gap-2 border border-blue-500"
                onClick={toggleCustomerModal}
                type="button"
              >
                <PlusIcon size={16} /> Novo cliente
              </Button>
            </div>

            {customerModal && (
              <NewCustomerForm
                closeModal={toggleCustomerModal}
                onCreated={handleCustomerCreated}
              />
            )}
          </div>
        </div>
      </div>

      <ItemsSection
        items={items}
        products={products}
        errors={errors}
        total={total}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onChangeProduct={onChangeProduct}
        onChangeUnitPrice={(i, v) => updateItem(i, { unit_price: Number(v) })}
        onChangeQuantity={(i, v) => updateItem(i, { quantity: Number(v) })}
        onChangeLength={onChangeLength}
        onChangeWidth={onChangeWidth}
        onChangeHeight={onChangeHeight}
      />

      {formError && (
        <div className="rounded-md border border-red-600 bg-red-200 px-3 py-2 text-sm font-bold text-red-600">
          {formError}
        </div>
      )}

      <div className="flex w-full items-center gap-4">
        <Link href="/sales">
          <Button variant="outline">Cancelar</Button>
        </Link>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={
            !customerId || items.length === 0 || hasItemErrors || submitting
          }
          className="disabled:opacity-40!"
        >
          {submitting ? "Salvando…" : "Salvar venda"}
        </Button>
      </div>
    </div>
  );
}
