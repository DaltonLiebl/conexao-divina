import type { Metadata } from "next";
import { connection } from "next/server";
import { TopBar } from "@/components/shell/top-bar";
import { VersiculoView } from "@/components/content/daily-views";
import { todayISO } from "@/lib/daily";

export const metadata: Metadata = { title: "Versículo do dia" };

export default async function VersiculoHojePage() {
  await connection();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title="Versículo do dia" backHref="/inicio" />
      <VersiculoView iso={todayISO()} isToday />
    </div>
  );
}
