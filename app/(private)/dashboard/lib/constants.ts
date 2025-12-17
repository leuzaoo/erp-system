export const PER_PAGE = 15;

export function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}
