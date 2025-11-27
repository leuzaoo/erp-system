export const dynamic = "force-dynamic";

import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import type { UserRow } from "@/types/UserRow";

import UsersPageClient from "./UsersPageClient";

export default async function UsersPage() {
  await requireRole(["admin"]);

  const supabase = await supabaseRSC();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, user_status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <pre className="text-red-600">
        Erro ao carregar usuários: {error.message}
      </pre>
    );
  }

  return <UsersPageClient users={(users ?? []) as UserRow[]} />;
}
