import { requireRole } from "@/utils/auth/requireRole";

export default async function UsersPage() {
  const { user, role } = await requireRole(["admin"]);

  return (
    <>
      <h1>Users page</h1>
    </>
  );
}
