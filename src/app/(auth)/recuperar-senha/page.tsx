import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false } };

export default function Page() {
  return (
    <>
      <p className="eyebrow">Recuperar acesso</p>
      <h1 className="mt-2 font-heading text-[2.2rem] leading-tight font-semibold">Esqueceu sua senha?</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Digite seu e-mail e enviaremos um link para criar uma nova senha.</p>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
      <p className="mt-10 text-center text-sm">
        <Link href="/inicio" className="text-muted-foreground hover:text-foreground hover:underline">
          Continuar sem conta
        </Link>
      </p>
    </>
  );
}
