import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default function Page() {
  return (
    <>
      <p className="eyebrow">Bem-vindo de volta</p>
      <h1 className="mt-2 font-heading text-[2.2rem] leading-tight font-semibold">Entre na sua conta</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Seus favoritos e seu progresso em qualquer aparelho.</p>
      <Suspense>
        <SignInForm />
      </Suspense>
      <p className="mt-10 text-center text-sm">
        <Link href="/inicio" className="text-muted-foreground hover:text-foreground hover:underline">
          Continuar sem conta
        </Link>
      </p>
    </>
  );
}
