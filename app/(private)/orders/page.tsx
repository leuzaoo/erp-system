import { requireRole } from "@/utils/auth/requireRole";

export default async function OrdersPage() {
  const { user, role } = await requireRole(["admin", "vendedor", "fabrica"]);

  return <div>OrdersPage</div>;
}
