import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import ProfilePageClient from "./ProfilePageClient";

export default async function ProfilePage() {
  const { user } = await requireRole(["admin", "vendedor"]);
  const supabase = await supabaseRSC();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-sm text-red-700">
          Erro ao carregar perfil. Contate o administrador.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Meu perfil</h1>
      <ProfilePageClient profile={profile} />
    </>
  );
}
