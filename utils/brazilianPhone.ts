import { stripNonDigits } from "./brazilianDocuments";

export const PHONE_MAX_DIGITS = 11;
export const PHONE_MIN_DIGITS = 10;

export function formatBrazilPhone(raw: string): string {
  const digits = stripNonDigits(raw).slice(0, PHONE_MAX_DIGITS);

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const hasNine = rest.length > 8;

  let formatted = "";

  if (ddd) {
    formatted += `(${ddd}`;
    formatted += digits.length > 2 ? ") " : "";
  } else {
    return digits;
  }

  if (!rest) return formatted;

  if (hasNine) {
    const first = rest.slice(0, 1);
    const mid = rest.slice(1, 5);
    const tail = rest.slice(5, 9);

    formatted += first;
    if (mid) formatted += ` ${mid}`;
    if (tail) formatted += `-${tail}`;
  } else {
    const mid = rest.slice(0, 4);
    const tail = rest.slice(4, 8);

    formatted += mid;
    if (tail) formatted += `-${tail}`;
  }

  return formatted;
}

export function isValidBrazilPhone(digits: string): boolean {
  const clean = stripNonDigits(digits);
  return clean.length >= PHONE_MIN_DIGITS && clean.length <= PHONE_MAX_DIGITS;
}
