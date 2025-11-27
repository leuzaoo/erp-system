import type { AppRole } from "@/utils/permissions";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  user_status: string | null;
  created_at: string;
};
