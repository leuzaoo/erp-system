import clsx from "clsx";

interface BadgeStatusProps {
  status: string;
}

export default function badgeClass(input: string | BadgeStatusProps) {
  const status = typeof input === "string" ? input : input.status;

  const klass = clsx(
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    {
      "bg-emerald-900/30 text-emerald-300 border-emerald-800":
        status === "APROVADO",
      "bg-amber-900/30 text-amber-300 border-amber-800": status === "EM_ESPERA",
      "bg-sky-900/30 text-sky-300 border-sky-800": status === "FABRICACAO",
      "bg-indigo-900/30 text-indigo-300 border-indigo-800":
        status === "EM_INSPECAO",
      "bg-green-900/30 text-green-300 border-green-800":
        status === "FINALIZADO",
      "bg-red-900/30 text-red-300 border-red-800": status === "CANCELADO",
    },
  );

  return <span className={klass}>{status.replaceAll("_", " ")}</span>;
}
