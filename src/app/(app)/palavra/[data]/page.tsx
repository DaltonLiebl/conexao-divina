import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { TopBar } from "@/components/shell/top-bar";
import { PalavraView } from "@/components/content/daily-views";
import { canShowDate, todayISO } from "@/lib/daily";

export const metadata: Metadata = { title: "Palavra do dia" };

export default async function PalavraDataPage({ params }: PageProps<"/palavra/[data]">) {
  await connection();
  const { data } = await params;
  const today = todayISO();
  if (data === today) redirect("/palavra");
  if (!canShowDate(data, today)) notFound();
  return (
    <div className="page">
      <TopBar title="Palavra do dia" backHref="/devocionais" />
      <PalavraView iso={data} isToday={false} />
    </div>
  );
}
