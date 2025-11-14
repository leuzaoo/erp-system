export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { LogOutIcon } from "lucide-react";

import { requireAuth } from "@/utils/auth/requireAuth";
import { supabaseRSC } from "@/utils/supabase/rsc";

import { signOut } from "@/app/actions/auth-actions";

import Sidebar from "@/app/components/Sidebar";

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAuth();

  const supabase = await supabaseRSC();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm text-red-700">
          Erro ao carregar perfil. Contate o administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar role={profile.role as "admin" | "vendedor" | "fabrica"} />

        <div className="min-w-0 flex-1">
          <header className="border-pattern-200 sticky top-0 z-50 border-b backdrop-blur">
            <div className="mx-auto flex h-14 items-center justify-between px-6">
              <div className="text-sm">
                <span className="capitalize">{profile.role}</span> •{" "}
                <span className="font-bold">{profile.name}</span>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  className="cursor-pointer rounded-2xl border border-red-400 bg-red-600 p-2 text-white hover:opacity-80"
                >
                  <LogOutIcon />
                </button>
              </form>
            </div>
          </header>

          <main className="mx-auto px-6 pt-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
