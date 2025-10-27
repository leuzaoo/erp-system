import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/utils/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <main style={{ padding: 20 }}>{children}</main>;
}
