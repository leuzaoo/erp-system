export default function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-neutral-800 p-3 text-left">{children}</th>
  );
}
