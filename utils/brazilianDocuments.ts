export type BrazilianDocumentKind = "CPF" | "RG";

export const CPF_DIGITS = 11;
export const RG_MIN_DIGITS = 7;
export const RG_MAX_DIGITS = 9;

export function stripNonDigits(value: string): string {
  return (value ?? "").replace(/\D/g, "");
}

export function getBrazilianDocumentKind(
  digits: string,
): BrazilianDocumentKind {
  const clean = stripNonDigits(digits);
  return clean.length > RG_MAX_DIGITS ? "CPF" : "RG";
}

export function formatCPF(rawDigits: string): string {
  const digits = stripNonDigits(rawDigits).slice(0, CPF_DIGITS);

  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 9);
  const d = digits.slice(9, 11);

  let out = a;
  if (b) out += `.${b}`;
  if (c) out += `.${c}`;
  if (d) out += `-${d}`;

  return out;
}

function formatRGBase(digits: string): string {
  if (digits.length <= 3) return digits;

  if (digits.length <= 6) {
    const head = digits.slice(0, digits.length - 3);
    const tail = digits.slice(-3);
    return `${head}.${tail}`;
  }

  const prefixLen = digits.length - 6;
  const prefix = digits.slice(0, prefixLen);
  const mid = digits.slice(prefixLen, prefixLen + 3);
  const tail = digits.slice(prefixLen + 3, prefixLen + 6);
  return `${prefix}.${mid}.${tail}`;
}

export function formatRG(rawDigits: string): string {
  const digits = stripNonDigits(rawDigits).slice(0, RG_MAX_DIGITS);

  if (digits.length <= 8) {
    return formatRGBase(digits);
  }

  const base = digits.slice(0, 8);
  const last = digits.slice(8, 9);
  return `${formatRGBase(base)}-${last}`;
}

export function isValidBrazilianDocumentDigits(digits: string): boolean {
  const clean = stripNonDigits(digits);
  if (!clean) return true;

  if (clean.length === CPF_DIGITS) return true;

  return clean.length >= RG_MIN_DIGITS && clean.length <= RG_MAX_DIGITS;
}

export function formatBrazilianDocument(rawDigits: string): string {
  const clean = stripNonDigits(rawDigits);
  const kind = getBrazilianDocumentKind(clean);
  return kind === "CPF" ? formatCPF(clean) : formatRG(clean);
}
