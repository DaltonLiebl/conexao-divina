import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function Page() {
  return (
    <>
      <p className="eyebrow">Comece hoje</p>
      <h1 className="mt-2 font-heading text-[2.2rem] leading-tight font-semibold">Crie sua conta grátis</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Guarde seu caminho com Deus e acesse de qualquer aparelho.</p>
      <Suspense>
        <SignUpForm />
      </Suspense>
      <p className="mt-10 text-center text-sm">
        <Link href="/inicio" className="text-muted-foreground hover:text-foreground hover:underline">
          Continuar sem conta
        </Link>
      </p>
    </>
  );
}
