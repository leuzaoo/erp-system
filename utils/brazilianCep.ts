import { stripNonDigits } from "./brazilianDocuments";

export const CEP_DIGITS = 8;

export function formatBrazilCep(raw: string): string {
  const digits = stripNonDigits(raw).slice(0, CEP_DIGITS);
  const a = digits.slice(0, 5);
  const b = digits.slice(5, 8);

  let out = a;
  if (b) out += `-${b}`;

  return out;
}

export function isValidBrazilCep(raw: string): boolean {
  const digits = stripNonDigits(raw);
  return digits.length === 0 || digits.length === CEP_DIGITS;
}
