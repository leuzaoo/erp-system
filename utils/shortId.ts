export function shortId(id: string): string {
  if (!id) return "";
  return "#" + id.slice(0, 5).toUpperCase();
}
