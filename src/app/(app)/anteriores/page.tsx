import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BookMarked, Sun } from "lucide-react";
import { TopBar } from "@/components/shell/top-bar";
import { HISTORY_DAYS, addDays, formatLongDate, palavraDoDia, todayISO, versiculoDoDia } from "@/lib/daily";
import { formatRef } from "@/lib/bible/books";

export const metadata: Metadata = { title: "Dias anteriores" };

export default async function AnterioresPage() {
  await connection();
  const today = todayISO();
  const days = Array.from({ length: HISTORY_DAYS + 1 }, (_, i) => addDays(today, -i));
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-32 md:px-8 md:pb-16">
      <TopBar title="Dias anteriores" backHref="/inicio" />
      <p className="mb-6 text-muted-foreground">
        Releia a Palavra e o Versículo dos últimos {HISTORY_DAYS} dias.
      </p>
      <ol className="space-y-4">
        {days.map((iso, i) => {
          const p = palavraDoDia(iso);
          const v = versiculoDoDia(iso);
          const isToday = i === 0;
          return (
            <li key={iso} className="rounded-3xl bg-card p-4 shadow-soft ring-1 ring-foreground/5">
              <p className="mb-2 px-1 text-sm font-bold first-letter:uppercase text-muted-foreground">
                {isToday ? "Hoje · " : i === 1 ? "Ontem · " : ""}
                {formatLongDate(iso)}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href={isToday ? "/palavra" : `/palavra/${iso}`}
                  className="flex min-h-14 items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2 hover:bg-muted"
                >
                  <Sun className="size-5 shrink-0 text-gold-ink" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Palavra</span>
                    <span className="block truncate font-semibold">{p.title}</span>
                  </span>
                </Link>
                <Link
                  href={isToday ? "/versiculo" : `/versiculo/${iso}`}
                  className="flex min-h-14 items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2 hover:bg-muted"
                >
                  <BookMarked className="size-5 shrink-0 text-sage-ink" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Versículo</span>
                    <span className="block truncate font-semibold">{formatRef(v.ref)}</span>
                  </span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
