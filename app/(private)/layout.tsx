export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import type { ReactNode } from "react";

import { supabaseRSC } from "@/utils/supabase/rsc";
import { signOut } from "../actions/auth-actions";

import Sidebar from "../components/Sidebar";

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
                  className="text-lighter cursor-pointer rounded-2xl border border-red-400 bg-red-600 p-2 hover:opacity-80"
                  title="Sair"
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
