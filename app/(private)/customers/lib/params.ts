export type CustomersSearchParams = {
  q?: string;
};

export function parseCustomersParams(params: CustomersSearchParams) {
  const rawQ = (params.q ?? "").trim();
  return { rawQ };
}

