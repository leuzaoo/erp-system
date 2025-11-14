import { redirect } from "next/navigation";

import { requireAuth } from "@/utils/auth/requireAuth";
import type { AppRole } from "@/utils/permissions";
import { supabaseRSC } from "@/utils/supabase/rsc";

import type { RequireRoleResult } from "@/types/RequireRoleResult";

export async function requireRole(
  allowedRoles: AppRole[],
  options?: { redirectTo?: string },
): Promise<RequireRoleResult> {
  const redirectTo = options?.redirectTo ?? "/dashboard";

  const user = await requireAuth();
  const supabase = await supabaseRSC();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  const role = profile.role as AppRole;

  if (!allowedRoles.includes(role)) {
    redirect(redirectTo);
  }

  return { user, role };
}
