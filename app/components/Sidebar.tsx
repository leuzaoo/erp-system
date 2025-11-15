"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

type Role = "admin" | "vendedor" | "fabrica";

type Item = { href: string; label: string; roles: Role[] };

const NAV: Item[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ["admin", "vendedor", "fabrica"],
  },
  { href: "/sales", label: "Vendas", roles: ["admin", "vendedor"] },
  { href: "/orders", label: "Pedidos", roles: ["admin", "fabrica"] },
  { href: "/products", label: "Produtos", roles: ["admin"] },
  { href: "/customers", label: "Clientes", roles: ["admin"] },
  { href: "/users", label: "Usuários", roles: ["admin"] },
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV.filter((i) => i.roles.includes(role));

  return (
    <aside className="text-darker border-pattern-200 sticky top-0 h-screen w-60 shrink-0 border-r">
      <div className="px-6 pt-6">
        <span className="text-3xl font-bold">ERP</span>
      </div>

      <nav className="mt-4 flex flex-col gap-2 space-y-1 p-2">
        {items.map((i) => {
          const active =
            pathname === i.href || pathname.startsWith(i.href + "/");
          return (
            <Link
              key={i.href}
              href={i.href}
              className={clsx(
                "block rounded-md px-4 py-3",
                active
                  ? "bg-darker text-lighter font-semibold"
                  : "text-medium hover:bg-pattern-100",
              )}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
