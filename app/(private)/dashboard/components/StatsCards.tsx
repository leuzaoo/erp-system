import { brazilianCurrency } from "@/utils/brazilianCurrency";

import type { DashboardUserRole } from "../lib/queries";

import Card from "@/app/components/Card";

type StatsCardsProps = {
  userRole: DashboardUserRole;
  ordersCount: number;
  ordersInProduction: number;
  ordersReadyToProduce: number;
  customersCount: number;
  totalOrdersPrice: number;
};

export default function StatsCards({
  userRole,
  ordersCount,
  ordersInProduction,
  ordersReadyToProduce,
  customersCount,
  totalOrdersPrice,
}: StatsCardsProps) {
  if (userRole === "fabrica") {
    return (
      <div className="flex items-center gap-4 overflow-x-auto">
        <Card className="flex max-w-max min-w-max flex-col gap-1">
          <span>Pronto para fabricar</span>
          <span className="text-2xl font-bold">{ordersReadyToProduce}</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 overflow-x-auto">
      <Card className="flex flex-col">
        <span>Vendas</span>
        <span className="text-2xl font-bold">{ordersCount}</span>
      </Card>
      <Card className="flex flex-col">
        <span>Em fabricação</span>
        <span className="text-2xl font-bold">{ordersInProduction}</span>
      </Card>
      <Card className="flex flex-col">
        <span>Clientes cadastrados</span>
        <span className="text-2xl font-bold">{customersCount}</span>
      </Card>
      <Card className="flex min-w-max flex-col">
        <span>Total de vendas</span>
        <span className="text-2xl font-bold">
          {brazilianCurrency(totalOrdersPrice)}
        </span>
      </Card>
    </div>
  );
}
