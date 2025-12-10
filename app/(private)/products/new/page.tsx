import Link from "next/link";

import { requireRole } from "@/utils/auth/requireRole";

import { NewProductForm } from "@/app/components/forms/NewProductForm";
import Button from "@/app/components/Button";

export default async function NewProductPage() {
  await requireRole(["admin"]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo Produto</h1>

        <Link href="/products">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <NewProductForm />
    </div>
  );
}
