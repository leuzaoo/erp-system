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
  { href: "/sales/new", label: "Nova venda", roles: ["admin", "vendedor"] },
  { href: "/orders", label: "Pedidos", roles: ["admin", "fabrica"] },
  { href: "/products", label: "Produtos", roles: ["admin"] },
  { href: "/customers", label: "Clientes", roles: ["admin", "vendedor"] },
  // { href: "/users",   label: "Usuários",  roles: ["admin"] }, // todo: quando for criar
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV.filter((i) => i.roles.includes(role));

  return (
    <aside className="sticky top-0 h-screen w-60 shrink-0 border-r border-neutral-800 bg-neutral-900/60 backdrop-blur">
      <div className="border-b border-neutral-800 px-4 py-4">
        <div className="text-lg font-semibold">ERP</div>
        <div className="text-xs text-neutral-400">MVP</div>
      </div>

      <nav className="p-2">
        {items.map((i) => {
          const active =
            pathname === i.href || pathname.startsWith(i.href + "/");
          return (
            <Link
              key={i.href}
              href={i.href}
              className={clsx(
                "block rounded-md border px-3 py-2 text-sm",
                active
                  ? "border-neutral-700 bg-neutral-800 text-neutral-100"
                  : "border-transparent text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100",
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
