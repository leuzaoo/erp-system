import moment from "moment";

export function createdAt(date: string | Date | null): string {
  if (!date) return "—";
  return moment(date).format("DD/MM/YYYY");
}
