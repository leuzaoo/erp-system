export type AppRole = "admin" | "vendedor" | "fabrica";

export function canEditOrder(params: {
  role: AppRole;
  userId: string;
  sellerId: string | null;
}): boolean {
  const { role, userId, sellerId } = params;

  // Hoje: só admin
  if (role === "admin") return true;

  // caso cliente quiser que vendedor edite
  // if (role === "vendedor" && sellerId && sellerId === userId) return true;

  return false;
}
