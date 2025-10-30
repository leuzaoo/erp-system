export default function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`border-b border-neutral-900 p-3 ${className}`}>
      {children}
    </td>
  );
}
