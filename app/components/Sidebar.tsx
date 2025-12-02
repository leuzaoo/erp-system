"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import {
  HandCoinsIcon,
  LayoutDashboardIcon,
  ListOrderedIcon,
  ClipboardListIcon,
  UsersRoundIcon,
  ShieldUserIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
} from "lucide-react";
import { useState } from "react";

type Role = "admin" | "vendedor" | "fabrica";

type Item = {
  href: string;
  label: string;
  roles: Role[];
  icon: React.ReactNode;
};

const NAV: Item[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ["admin", "vendedor", "fabrica"],
    icon: <LayoutDashboardIcon strokeWidth={1.5} />,
  },
  {
    href: "/sales",
    label: "Vendas",
    roles: ["admin", "vendedor"],
    icon: <HandCoinsIcon strokeWidth={1.5} />,
  },
  {
    href: "/orders",
    label: "Pedidos",
    roles: ["admin", "fabrica"],
    icon: <ListOrderedIcon strokeWidth={1.5} />,
  },
  {
    href: "/products",
    label: "Produtos",
    roles: ["admin"],
    icon: <ClipboardListIcon strokeWidth={1.5} />,
  },
  {
    href: "/customers",
    label: "Clientes",
    roles: ["admin"],
    icon: <UsersRoundIcon strokeWidth={1.5} />,
  },
  {
    href: "/users",
    label: "Usuários",
    roles: ["admin"],
    icon: <ShieldUserIcon strokeWidth={1.5} />,
  },
];

const companyName = "ERP System";

export default function Sidebar({ role }: { role: Role }) {
  const [showNavbar, setShowNavbar] = useState(true);

  const toggleNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  const pathname = usePathname();
  const items = NAV.filter((i) => i.roles.includes(role));

  return (
    <aside
      className={clsx(
        "text-darker border-pattern-200 sticky top-0 h-screen shrink-0 border-r",
        "transition-all duration-300 ease-in-out",
        "overflow-hidden",
        showNavbar ? "w-60" : "w-18",
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-between px-6",
          "h-16",
          "transition-all duration-300",
        )}
      >
        <span
          className={clsx(
            "text-xl font-semibold whitespace-nowrap",
            "origin-left transition-all duration-300",
            showNavbar
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0",
          )}
        >
          {showNavbar && companyName}
        </span>
        <button
          onClick={toggleNavbar}
          className="hover:bg-pattern-100 cursor-pointer rounded-md p-1"
        >
          {showNavbar ? <ArrowLeftToLineIcon /> : <ArrowRightToLineIcon />}
        </button>
      </div>

      <nav className="mt-4 flex flex-col gap-2 p-2">
        {items.map((i) => {
          const active =
            pathname === i.href || pathname.startsWith(i.href + "/");
          return (
            <Link
              key={i.href}
              href={i.href}
              className={clsx(
                "flex items-center gap-2 rounded-xl px-4 py-3",
                showNavbar ? "justify-start" : "",
                active
                  ? "bg-darker text-lighter font-semibold"
                  : "text-medium hover:bg-pattern-100",
              )}
            >
              {showNavbar ? (
                <>
                  <span className="inline-block">{i.icon}</span>
                  {i.label}
                </>
              ) : (
                <span className="inline-block">{i.icon}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
