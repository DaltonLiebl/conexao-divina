"use client";

import { useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
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
    <section className="relative isolate -mx-5 overflow-hidden md:mx-0 md:rounded-4xl md:shadow-lift">
      <div className="absolute inset-0 -z-10">
        <Scene variant={sceneForHour(hour)} />
        <div className="absolute inset-0 bg-linear-to-t from-[#0d1724]/85 via-[#0d1724]/30 to-transparent" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-[19rem] flex-col justify-end px-6 pb-7 pt-24 text-white md:min-h-[22rem] md:px-8"
      >
        <p className="text-sm font-semibold first-letter:uppercase text-white/85">{formatLongDate(todayIso)}</p>
        <h1 className="mt-1 text-[2.6rem] leading-[1.05] font-semibold">
          {hello}
          {name ? `, ${name}` : ""}!
        </h1>
        <p className="mt-2 max-w-md font-reading text-lg italic text-white/90">{blessing}</p>
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
      className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-gold/30"
    >
      <p className="eyebrow">Bem-vindo</p>
      <label htmlFor="primeiro-nome" className="mt-1 block font-heading text-2xl font-semibold">
        Qual é o seu primeiro nome?
      </label>
      <p className="mt-1 text-muted-foreground">Assim a gente pode chamar você pelo nome todos os dias.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
