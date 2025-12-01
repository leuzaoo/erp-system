import moment from "moment";

export function createdAtWithHours(date: string | Date | null): string {
  if (!date) return "—";
  return moment(date).format("DD/MM/YYYY - HH:mm");
}
