"use client";

import * as React from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

import { deleteProduct, deactivateProduct } from "../actions/product-actions";
import Button from "@/app/components/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
};

export function ProductHandleActions({ id }: Props) {
  const [showModal, setShowModal] = React.useState(false);
  const [submitting, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  async function handleDelete() {
    if (loading) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.",
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteProduct(id);

      if (!res.ok) {
        throw new Error(res.message || "Erro ao deletar produto.");
      }

      toast.success("Produto deletado com sucesso.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao deletar produto.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const handleDeactivate = () => {
    setError(null);
    startTransition(async () => {
      const res = await deactivateProduct(id);
      if (res.ok) {
        setShowModal(false);
      } else {
        setError(res.message || "Erro ao inativar produto.");
      }
    });
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Link
          href={`/products/${id}`}
          className="rounded-md border border-neutral-700 px-2 py-1"
        >
          <EyeIcon strokeWidth={1.5} size={20} />
        </Link>
        <Link
          href={`/products/edit/${id}`}
          className="rounded-md border border-neutral-700 px-2 py-1"
        >
          <PencilIcon strokeWidth={1.5} size={20} />
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={submitting}
          className="cursor-pointer rounded-md border border-red-600 px-2 py-1 text-red-600 hover:bg-red-900/20 disabled:opacity-50"
        >
          <Trash2Icon strokeWidth={1.5} size={20} />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center shadow-2xl">
            <h2 className="mb-2 text-lg font-semibold text-white">
              Não é possível excluir este produto
            </h2>
            <p className="mb-4 text-sm text-neutral-300">
              Esse produto está relacionado a um pedido realizado e não pode ser
              deletado.
              <br />
              Você pode torná-lo <strong>inativo</strong> para impedir novas
              vendas com ele.
            </p>

            {error && (
              <div className="mb-3 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="mt-2 flex justify-center gap-3">
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={submitting}
                variant="outline"
                className="text-lighter border-white"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleDeactivate}
                disabled={submitting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                Tornar inativo
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
