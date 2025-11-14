import type { AppRole } from "@/utils/permissions";

export type RequireRoleResult = {
  user: { id: string };
  role: AppRole;
};
