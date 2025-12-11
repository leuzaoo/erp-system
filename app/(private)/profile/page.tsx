import moment from "moment";

import { requireRole } from "@/utils/auth/requireRole";
import { supabaseRSC } from "@/utils/supabase/rsc";

import DescriptionList from "@/app/components/DescriptionList";
import Card from "@/app/components/Card";

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
      <section className="mt-4 flex w-full flex-col gap-4">
        <Card className="max-w-max">
          <h2 className="text-lg font-bold">Informações</h2>
          <DescriptionList dt="Nome completo" dd={profile.name} capitalize />
          <DescriptionList dt="Função" dd={profile.role} capitalize />
          <DescriptionList dt="Email" dd={profile.email} />
          <DescriptionList
            dt="Criado em"
            dd={moment(profile.created_at).format("DD/MM/YYYY")}
          />
        </Card>
      </section>
    </>
  );
}
