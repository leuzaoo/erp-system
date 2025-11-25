export type AppRole = "admin" | "vendedor" | "fabrica";

export const ALLOW_SELLER_EDIT_OWN_ORDERS = false;
export const ALLOW_FACTORY_EDIT_ORDERS = true;

export function canEditOrder(params: {
  role: AppRole;
  userId: string;
  sellerId: string | null;
}): boolean {
  const { role, userId, sellerId } = params;

  if (role === "admin") return true;

  if (
    ALLOW_SELLER_EDIT_OWN_ORDERS &&
    role === "vendedor" &&
    sellerId &&
    sellerId === userId
  ) {
    return true;
  }

  if (ALLOW_FACTORY_EDIT_ORDERS && role === "fabrica") {
    return true;
  }

  return false;
}
