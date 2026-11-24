import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { TopBar } from "@/components/shell/top-bar";
import { VersiculoView } from "@/components/content/daily-views";
import { canShowDate, todayISO } from "@/lib/daily";

export const metadata: Metadata = { title: "Versículo do dia" };

export default async function VersiculoDataPage({ params }: PageProps<"/versiculo/[data]">) {
  await connection();
  const { data } = await params;
  const today = todayISO();
  if (data === today) redirect("/versiculo");
  if (!canShowDate(data, today)) notFound();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title="Versículo do dia" backHref="/anteriores" />
      <VersiculoView iso={data} isToday={false} />
    </div>
  );
}
