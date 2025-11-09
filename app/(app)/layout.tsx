import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { supabaseRSC } from "@/utils/supabase/rsc";
import { signOut } from "../actions/logout-action";

import Sidebar from "../components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex">
        <Sidebar role={profile.role as "admin" | "vendedor" | "fabrica"} />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
              <div className="text-sm text-neutral-400">
                Logado como{" "}
                <span className="font-medium text-neutral-200">
                  {profile.name}
                </span>{" "}
                • <span className="uppercase">{profile.role}</span>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700"
                >
                  Sair
                </button>
              </form>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
