import type { SortField } from "./SortField";

export type SearchParams = {
  q?: string;
  sort?: SortField;
  dir?: "asc" | "desc";
};
