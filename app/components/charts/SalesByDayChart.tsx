"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Button from "../Button";
import Input from "../Input";
import Card from "../Card";

type SalesByDayItem = {
  day: string;
  total: number;
};

type Props = {
  data: SalesByDayItem[];
  initialRange?: string;
  // when we have the custom date, but for now is commented
  initialStart?: string;
  initialEnd?: string;
};

const PRESETS = [
  { label: "7 dias", value: "7" },
  { label: "14 dias", value: "14" },
  { label: "30 dias", value: "30" },
  { label: "60 dias", value: "60" },
  { label: "90 dias", value: "90" },
  // { label: "Personalizado", value: "custom" },
] as const;

function formatDayLabel(isoDay: string) {
  const [y, m, d] = isoDay.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(dt);
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computePreset(days: number) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  return { start: toISODate(start), end: toISODate(end) };
}

export default function SalesByDayChart({
  data,
  initialRange,
  initialStart,
  initialEnd,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const defaultRange = initialRange ?? sp.get("range") ?? "14";
  const defaultStart = initialStart ?? sp.get("start") ?? "";
  const defaultEnd = initialEnd ?? sp.get("end") ?? "";

  const [range, setRange] = React.useState<string>(defaultRange);
  const [start, setStart] = React.useState<string>(defaultStart);
  const [end, setEnd] = React.useState<string>(defaultEnd);

  const toastIdRef = React.useRef<string | number | null>(null);
  const applyingRef = React.useRef(false);
  const lastAppliedKeyRef = React.useRef<string>("");

  const [isApplying, setIsApplying] = React.useState(false);

  React.useEffect(() => {
    if (range === "custom") return;

    const days = Number(range);
    if (!Number.isFinite(days) || days <= 0) return;

    const { start: s, end: e } = computePreset(days);
    setStart(s);
    setEnd(e);
  }, [range]);

  React.useEffect(() => {
    const r = sp.get("range") ?? "";
    const s = sp.get("start") ?? "";
    const e = sp.get("end") ?? "";
    if (!r && !s && !e) return;

    const key = `${r}:${s}:${e}`;
    if (lastAppliedKeyRef.current === key) return;
    lastAppliedKeyRef.current = key;

    if (applyingRef.current) {
      applyingRef.current = false;
      setIsApplying(false);

      if (toastIdRef.current != null) {
        toast.success("Filtro aplicado com sucesso.", {
          id: toastIdRef.current,
        });
      } else {
        toast.success("Filtro aplicado com sucesso.");
      }
      toastIdRef.current = null;
    } else {
      toast.success("Filtro aplicado com sucesso.");
    }
  }, [sp]);

  function applyFilter(nextRange?: string) {
    if (isApplying) return;

    const effectiveRange = nextRange ?? range;

    let nextStart = start;
    let nextEnd = end;

    if (effectiveRange !== "custom") {
      const days = Number(effectiveRange);
      if (Number.isFinite(days) && days > 0) {
        const computed = computePreset(days);
        nextStart = computed.start;
        nextEnd = computed.end;
      }
    }

    if (!nextStart || !nextEnd) {
      toast.error("Selecione data de início e final.");
      return;
    }
    if (nextStart > nextEnd) {
      toast.error("A data de início não pode ser maior que a data final.");
      return;
    }

    const msg =
      effectiveRange !== "custom"
        ? `Aplicando filtro: Últimos ${effectiveRange} dias.`
        : `Aplicando filtro: ${nextStart} até ${nextEnd}…`;

    const id = toastIdRef.current ?? `chart-filter-${Date.now()}`;
    toastIdRef.current = id;
    toast.loading(msg, { id });

    applyingRef.current = true;
    setIsApplying(true);

    const params = new URLSearchParams(sp.toString());

    params.delete("page");

    params.set("range", effectiveRange || "custom");
    params.set("start", nextStart);
    params.set("end", nextEnd);

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const chartData = React.useMemo(
    () =>
      (data ?? []).map((d) => ({
        ...d,
        label: formatDayLabel(d.day),
      })),
    [data],
  );

  return (
    <Card className="min-w-full">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <p className="text-pattern-800 text-xl font-medium">Vendas por dia</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <select
                value={range}
                disabled={isApplying}
                onChange={(e) => {
                  const nextRange = e.target.value;
                  setRange(nextRange);
                  applyFilter(nextRange);
                }}
                className="bg-pattern-100/50 hover:bg-pattern-100 cursor-pointer appearance-none rounded-md px-5 py-3 pr-12 transition-all duration-300 outline-none disabled:opacity-60"
              >
                {PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              <ChevronDownIcon className="text-pattern-600 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" />
            </div>
          </div>

          {/* todo: custom date range. Commented for now */}
          {/* <div className="flex items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-600">
                Início
              </span>
              <Input
                type="date"
                value={start}
                size="sm"
                onChange={(e) => {
                  setRange("custom");
                  setStart(e.target.value);
                }}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-600">
                Final
              </span>
              <Input
                type="date"
                value={end}
                size="sm"
                onChange={(e) => {
                  setRange("custom");
                  setEnd(e.target.value);
                }}
              />
            </label>

            <Button
              type="button"
              onClick={() => applyFilter()}
              className="text-xs"
            >
              Aplicar
            </Button>            

            <Button
              type="button"
              variant="outline"
              onClick={clearFilter}
              className="text-xs"
            >
              Limpar
            </Button>
          </div> */}
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: 4, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => {
                const n = Number(v);
                if (!Number.isFinite(n)) return String(v);

                if (n >= 1_000_000) return `R$${Math.round(n / 1_000_000)}M`;
                if (n >= 1_000) return `R$${Math.round(n / 1_000)}K`;
                if (n <= 1_000) return `R$${Math.round(n / 1_000)}`;

                return `${Math.round(n)}`;
              }}
            />

            <Tooltip
              formatter={(value) => {
                const n = Number(value);
                return [formatBRL(Number.isFinite(n) ? n : 0), "Total"];
              }}
              labelFormatter={(label) => `Dia: ${label}`}
              contentStyle={{ borderRadius: 12 }}
            />

            <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
