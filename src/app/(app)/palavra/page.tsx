import type { Metadata } from "next";
import { connection } from "next/server";
import { TopBar } from "@/components/shell/top-bar";
import { PalavraView } from "@/components/content/daily-views";
import { todayISO } from "@/lib/daily";

export const metadata: Metadata = { title: "Palavra do dia" };

export default async function PalavraHojePage() {
  await connection();
  return (
    <div className="page">
      <TopBar title="Palavra do dia" backHref="/inicio" />
      <PalavraView iso={todayISO()} isToday />
    </div>
  );
}
