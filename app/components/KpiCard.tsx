export default function KpiCard({
  title,
  value,
}: {
  title: string;
  value: string | number | undefined;
}) {
  return (
    <div className="bg-pattern-100 text-darker border-pattern-200 min-w-48 rounded-lg border p-4">
      <div className="text">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
