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
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title="Palavra do dia" backHref="/anteriores" />
      <PalavraView iso={data} isToday={false} />
    </div>
  );
}
