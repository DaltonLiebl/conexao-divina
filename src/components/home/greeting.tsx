"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { ArrowRight, HeartPulse } from "lucide-react";
import { Scene, sceneForHour } from "@/components/brand/scene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalProfile } from "@/lib/local-store";
import { formatLongDate } from "@/lib/daily";

const noop = () => () => {};
/** Hora local do aparelho (no servidor, assume manhã). */
function useHour() {
  return useSyncExternalStore(
    noop,
    () => new Date().getHours(),
    () => 8,
  );
}

function greetingFor(hour: number) {
  if (hour >= 5 && hour < 12) return { hello: "Bom dia", blessing: "Que a paz de Deus esteja com você neste novo dia." };
  if (hour >= 12 && hour < 18) return { hello: "Boa tarde", blessing: "Que o Senhor renove as suas forças nesta tarde." };
  return { hello: "Boa noite", blessing: "Descanse no cuidado de Deus. Ele guarda você esta noite." };
}

export function Greeting({ todayIso }: { todayIso: string }) {
  const hour = useHour();
  const [profile] = useLocalProfile();
  const { hello, blessing } = greetingFor(hour);
  const name = profile.name.trim();

  return (
    <section className="relative isolate -mx-5 h-full overflow-hidden md:mx-0 md:rounded-4xl md:shadow-lift md:ring-1 md:ring-white/5">
      <div className="absolute inset-0 -z-10">
        <Scene variant={sceneForHour(hour)} />
        <div className="absolute inset-0 bg-linear-to-t from-[#0b1220] via-[#0b1220]/55 to-[#0b1220]/10" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0b1220]/70 via-transparent to-transparent" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-full min-h-[21rem] flex-col justify-end px-6 pb-8 pt-24 text-[#f5f1e8] md:min-h-[24rem] md:px-10 md:pb-10 xl:min-h-[26rem]"
      >
        <p className="text-sm font-medium tracking-wide text-[#e8d5ac] first-letter:uppercase">{formatLongDate(todayIso)}</p>
        <h1 className="mt-2 font-heading text-[2.5rem] leading-[1.05] font-semibold md:text-[3.2rem] xl:text-[3.6rem]">
          {hello}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="mt-3 max-w-xl font-heading text-lg italic text-[#f5f1e8]/85 md:text-xl">{blessing}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="gold"
            size="lg"
            className="h-12 px-6 text-base"
            render={<Link href="/palavra" />}
            nativeButton={false}
          >
            Palavra de hoje
            <ArrowRight />
          </Button>
          <Button
            size="lg"
            className="h-12 border-white/20 bg-white/10 px-6 text-base text-[#f5f1e8] backdrop-blur-sm hover:bg-white/18"
            variant="outline"
            render={<Link href="/coracao" />}
            nativeButton={false}
          >
            <HeartPulse />
            Como está seu coração?
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

/** Pergunta o primeiro nome na primeira visita (pode pular). */
export function NamePrompt() {
  const [profile, setProfile] = useLocalProfile();
  const [value, setValue] = useState("");
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  if (!mounted || profile.askedName) return null;

  const save = (name: string) => setProfile({ name: name.trim().slice(0, 40), askedName: true });

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(e) => {
        e.preventDefault();
        save(value);
      }}
      className="surface flex flex-col gap-4 p-5 ring-gold/30 md:p-6 lg:flex-row lg:items-center lg:gap-8"
    >
      <div className="lg:flex-1">
        <p className="eyebrow">Bem-vindo</p>
        <label htmlFor="primeiro-nome" className="mt-1.5 block font-heading text-2xl font-semibold">
          Qual é o seu primeiro nome?
        </label>
        <p className="mt-1 text-muted-foreground">Assim a gente pode chamar você pelo nome todos os dias.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row lg:w-[28rem]">
        <Input
          id="primeiro-nome"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex.: Maria"
          autoComplete="given-name"
          maxLength={40}
          className="sm:flex-1"
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={!value.trim()} className="flex-1 sm:flex-none">
            Salvar
          </Button>
          <Button type="button" variant="ghost" onClick={() => save("")}>
            Pular
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
