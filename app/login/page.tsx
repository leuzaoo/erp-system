import { supabaseRSC } from "@/utils/supabase/rsc";
import { redirect } from "next/navigation";

import LoginForm from "../components/forms/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const supabase = await supabaseRSC();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center">
      <LoginForm redirectTo={searchParams.redirect ?? null} />;
    </div>
  );
}
