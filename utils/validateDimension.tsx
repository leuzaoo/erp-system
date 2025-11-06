export function validateDimension(
  label: "Comprimento" | "Largura" | "Altura",
  value: number | "" | undefined,
  max: number | null | undefined,
): string | undefined {
  if (value === "" || value == null) return `${label} é obrigatório.`;

  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return `${label} inválido.`;

  if (max != null && num > max) {
    return `Excede o limite do produto (${max.toFixed(2)}cm).`;
  }
  return;
}
