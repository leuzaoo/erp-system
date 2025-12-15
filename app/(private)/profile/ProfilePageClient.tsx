import moment from "moment";

import Input from "@/app/components/Input";
import Card from "@/app/components/Card";

type Props = {
  profile: {
    id: string;
    name: string;
    role: string;
    email: string;
    created_at: string;
  };
};

export default async function ProfilePageClient({ profile }: Props) {
  return (
    <section className="mt-4 flex w-full flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Informações pessoais</h2>
        </div>
        <div className="border-pattern-200 mt-8 grid w-full grid-cols-2 items-center justify-between border-t pt-8 pb-4">
          <span className="text-sm font-bold">Nome</span>
          <Input variant="light" value={profile.name} readOnly />
        </div>
        <div className="border-pattern-200 mt-8 grid w-full grid-cols-2 items-center justify-between border-t pt-8 pb-4">
          <span className="text-sm font-bold">Email</span>
          <Input variant="light" value={profile.email} readOnly />
        </div>
        <div className="border-pattern-200 mt-8 grid w-full grid-cols-2 items-center justify-between border-t pt-8 pb-4">
          <span className="text-sm font-bold">Função</span>
          <span className="text-sm capitalize">{profile.role}</span>
        </div>
        <div className="border-pattern-200 mt-8 grid w-full grid-cols-2 items-center justify-between border-t pt-8 pb-4">
          <span className="text-sm font-bold">Criado em</span>
          <span className="text-sm">
            {moment(profile.created_at).format("DD/MM/YYYY")}
          </span>
        </div>
      </Card>
    </section>
  );
}
