import Link from "next/link";
import {
  BadgeCheckIcon,
  CircleSlashIcon,
  PencilIcon,
  UserCircle2Icon,
} from "lucide-react";
import moment from "moment";
import clsx from "clsx";

import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import type { CustomersTableRow } from "@/types/CustomersTableRow";
import type { SalesTableRow } from "@/types/SalesTableRow";
import type { UserRow } from "@/types/UserRow";

import UserDetailsTabs from "@/app/components/UserDetailsTabs";
import Button from "@/app/components/Button";

export default async function SingleUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const supabase = await supabaseRSC();

  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <pre className="text-red-400">ID inválido.</pre>;
  }

  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, user_status, created_at")
    .eq("id", id)
    .single<UserRow>();

  if (error || !user) {
    return (
      <pre className="text-red-600">
        Erro ao carregar usuário: {error?.message ?? "Não encontrado."}
      </pre>
    );
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name_snapshot, seller_name_snapshot, total_price, status, created_at",
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return (
      <pre className="text-red-600">
        Erro ao carregar vendas do usuário: {ordersError.message}
      </pre>
    );
  }

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, name, document, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (customersError) {
    return (
      <pre className="text-red-600">
        Erro ao carregar clientes do usuário: {customersError.message}
      </pre>
    );
  }

  const shortId = user.id.slice(0, 5).toUpperCase();

  const createdAt = moment(user.created_at).format("DD/MM/YYYY");

  const status = String(user.user_status ?? "ativo");
  const isActive = status === "ativo";

  return (
    <div className="space-y-6">
      <section>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <UserCircle2Icon size={60} strokeWidth={1} />
            <div className="flex flex-col justify-between">
              <h1 className="text-2xl font-medium">{user.name}</h1>
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    isActive
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-neutral-300 bg-neutral-100 text-neutral-600",
                  )}
                >
                  {isActive ? (
                    <p className="flex items-center gap-1">
                      <BadgeCheckIcon size={14} /> {status}
                    </p>
                  ) : (
                    <p className="flex items-center gap-1">
                      <CircleSlashIcon size={14} /> {status}
                    </p>
                  )}
                </span>

                <span className="text-pattern-600 text-sm">
                  ID do usuário: #{shortId}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between">
            <Link href={`/users/${user.id}/edit`}>
              <Button>
                <PencilIcon size={16} />
                Editar
              </Button>
            </Link>
            <span className="text-sm">Usuário criado em: {createdAt}</span>
          </div>
        </div>
      </section>

      <UserDetailsTabs
        orders={(orders ?? []) as SalesTableRow[]}
        customers={(customers ?? []) as CustomersTableRow[]}
      />
    </div>
  );
}
