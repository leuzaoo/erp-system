export const ORDER_STATUS = {
  ENVIADO: "ENVIADO",
  APROVADO: "APROVADO",
  EM_ESPERA: "EM_ESPERA",
  FABRICACAO: "FABRICACAO",
  EM_INSPECAO: "EM_INSPECAO",
  FINALIZADO: "FINALIZADO",
  CANCELADO: "CANCELADO",
};

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ENVIADO: "Enviado",
  APROVADO: "Aprovado",
  EM_ESPERA: "Em espera",
  FABRICACAO: "Em fabricação",
  EM_INSPECAO: "Em inspeção",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  ENVIADO: "border border-blue-700 bg-blue-900/30 text-blue-600",
  APROVADO: "border border-sky-500 bg-sky-900/60 text-white",
  FABRICACAO: "border border-yellow-700 bg-yellow-300/50 text-yellow-700",
  EM_INSPECAO: "border border-purple-700 bg-purple-300/50 text-purple-700",
  FINALIZADO: "border border-emerald-700 bg-emerald-900/30 text-emerald-700",
  EM_ESPERA: "border border-neutral-700 bg-neutral-900/40 text-black",
  CANCELADO: "border border-red-800 bg-red-900/30 text-red-600",
};
