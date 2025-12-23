"use client";

import moment from "moment";

import type { ProfileSale } from "@/types/ProfileSale";

import ProfileDetailsTabs from "@/app/components/ProfileDetailsTabs";
import Input from "@/app/components/Input";
import Card from "@/app/components/Card";

type Props = {
  profile: {
    id: string;
    name: string;
    role: "admin" | "vendedor" | "fabrica";
    email: string;
    created_at: string;
  };
  sales: {
    ordersCount: number;
    customersCount: number;
    totalSales: number;
    orders: ProfileSale[];
  };
};

export default function ProfilePageClient({ profile, sales }: Props) {
  const info = (
    <Card>
      <div className="border-pattern-200 grid w-full grid-cols-2 items-center justify-between">
        <span className="text-sm font-bold">Nome</span>
        <Input variant="light" value={profile.name} readOnly />
      </div>

      <div className="border-pattern-200 mt-8 grid w-full grid-cols-2 items-center justify-between border-t pt-8">
        <span className="text-sm font-bold">Email</span>
        <Input variant="light" value={profile.email} readOnly />
      </div>

      <div className="border-pattern-200 mt-8 grid w-full grid-cols-2 items-center justify-between border-t pt-8">
        <span className="text-sm font-bold">Função</span>
        <span className="text-sm capitalize">{profile.role}</span>
      </div>

      <div className="border-pattern-200 mt-8 grid w-full grid-cols-2 items-center justify-between border-t pt-8">
        <span className="text-sm font-bold">Criado em</span>
        <span className="text-sm">
          {moment(profile.created_at).format("DD/MM/YYYY")}
        </span>
      </div>
    </Card>
  );

  return (
    <ProfileDetailsTabs
      info={info}
      sales={{
        ...sales,
        role: profile.role,
      }}
    />
  );
}
