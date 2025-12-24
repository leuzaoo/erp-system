import { brazilianCurrency } from "@/utils/brazilianCurrency";

import type {
  CustomersRankingItem,
  OrdersCountRankingItem,
  OrdersValueRankingItem,
} from "../lib/queries";

import Card from "@/app/components/Card";

type RankingsCardsProps = {
  userRole: "admin" | "vendedor";
  ordersByCount: OrdersCountRankingItem[];
  ordersByValue: OrdersValueRankingItem[];
  customersByCount: CustomersRankingItem[];
};

const SHOW_VALUES_FOR_SELLER = true;

type RankingRow = {
  rank: number;
  name: string;
  value: string | number;
};

type RankingCardProps = {
  title: string;
  valueLabel: string;
  rows: RankingRow[];
  emptyMessage: string;
};

function RankingCard({
  title,
  valueLabel,
  rows,
  emptyMessage,
}: RankingCardProps) {
  return (
    <Card className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {!rows.length ? (
        <p className="text-pattern-800 text-sm">{emptyMessage}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-pattern-700 border-pattern-200 border-b text-left">
              <th className="py-2 pr-2 font-semibold">Pos.</th>
              <th className="py-2 pr-2 font-semibold">Vendedor</th>
              <th className="py-2 text-right font-semibold">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.rank}-${row.name}`}
                className="border-pattern-100 border-b"
              >
                <td className="py-2 pr-2 font-semibold">{row.rank}</td>
                <td className="py-2 pr-2">{row.name}</td>
                <td className="py-2 text-right font-semibold">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export default function RankingsCards({
  userRole,
  ordersByCount,
  ordersByValue,
  customersByCount,
}: RankingsCardsProps) {
  const countRows: RankingRow[] = ordersByCount.map((item, index) => ({
    rank: index + 1,
    name: item.sellerName,
    value: item.ordersCount,
  }));

  const canShowValues =
    userRole === "admin" || (userRole === "vendedor" && SHOW_VALUES_FOR_SELLER);

  const valueRows: RankingRow[] = ordersByValue.map((item, index) => ({
    rank: index + 1,
    name: item.sellerName,
    value: canShowValues ? brazilianCurrency(item.totalValue) : "—",
  }));

  const customerRows: RankingRow[] = customersByCount.map((item, index) => ({
    rank: index + 1,
    name: item.sellerName,
    value: item.customersCount,
  }));

  return (
    <div className="space-y-4">
      <RankingCard
        title="Vendas por quantidade"
        valueLabel="Qtd."
        rows={countRows}
        emptyMessage="Nenhuma venda no período."
      />
      <RankingCard
        title="Vendas por valor"
        valueLabel="Valor"
        rows={valueRows}
        emptyMessage="Nenhuma venda no período."
      />
      <RankingCard
        title="Clientes cadastrados"
        valueLabel="Clientes"
        rows={customerRows}
        emptyMessage="Nenhum cliente no período."
      />
    </div>
  );
}
