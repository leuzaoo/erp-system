export const PER_PAGE = 7;

export function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}
