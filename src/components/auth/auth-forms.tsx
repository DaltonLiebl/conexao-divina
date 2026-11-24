"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Info, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase/client";
import { authEnabled, googleEnabled, safeNext } from "@/lib/supabase/config";
import { useUser } from "./use-session";

// ---------------------------------------------------------------------------
// utilidades

const MIN_PASSWORD = 8;

function traduzirErro(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar. Procure a mensagem do Conexão Divina na sua caixa de entrada.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  if (m.includes("password") && (m.includes("short") || m.includes("least") || m.includes("weak")))
    return `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres, com letras e números.`;
  if (m.includes("same password") || m.includes("different from the old"))
    return "A nova senha precisa ser diferente da anterior.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "O cadastro de novas contas está temporariamente fechado.";
  if (m.includes("network") || m.includes("fetch")) return "Sem conexão com a internet. Verifique e tente de novo.";
  return "Não foi possível concluir agora. Tente novamente em instantes.";
}

function validarSenha(p: string) {
  if (p.length < MIN_PASSWORD) return `Use pelo menos ${MIN_PASSWORD} caracteres.`;
  if (!/[a-zA-Z]/.test(p) || !/\d/.test(p)) return "Use letras e números.";
  return null;
}

/** Aviso quando o login ainda não foi ligado (sem fingir que funciona). */
export function AuthNotConfigured() {
  return (
    <div className="rounded-2xl border border-gold/30 bg-gold/8 p-5">
      <p className="flex items-center gap-2 font-semibold">
        <Info className="size-5 text-gold" aria-hidden /> O login está sendo ativado
      </p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
        As contas ainda não estão disponíveis. Enquanto isso, você pode usar o app normalmente: seus favoritos e
        seu progresso ficam salvos neste aparelho.
      </p>
      <Button className="mt-4 w-full" render={<Link href="/inicio" />} nativeButton={false}>
        Continuar sem conta
      </Button>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
  extra,
}: {
  id: string;
  label: string;
  error?: string | null;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-[0.95rem] font-semibold">
          {label}
        </Label>
        {extra}
      </div>
      {children}
      {error ? (
        <p id={`${id}-erro`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-erro` : undefined}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Esconder senha" : "Mostrar senha"}
        className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
      </button>
    </div>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

function GoogleButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  if (!googleEnabled) return null;
  return (
    <>
      <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const { error } = await getSupabase()!.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
          });
          if (error) {
            toast.error(traduzirErro(error.message));
            setBusy(false);
          }
        }}
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3z" />
          <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
        </svg>
        Entrar com Google
      </Button>
    </>
  );
}

// ---------------------------------------------------------------------------
// Entrar

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("erro") === "link" ? "O link expirou ou já foi usado. Entre com sua senha ou peça um novo link." : null,
  );

  if (!authEnabled) return <AuthNotConfigured />;

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim() || !password) {
          setError("Preencha o e-mail e a senha.");
          return;
        }
        setBusy(true);
        setError(null);
        const supabase = getSupabase()!;
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) {
          setError(traduzirErro(err.message));
          setBusy(false);
          return;
        }
        const { data: profile } = await supabase.rpc("ensure_profile");
        if (profile?.access_status === "blocked") {
          await supabase.auth.signOut();
          setError("Esta conta está bloqueada. Fale com o suporte do Conexão Divina.");
          setBusy(false);
          return;
        }
        toast.success("Que bom ter você aqui!");
        router.replace(next);
        router.refresh();
      }}
    >
      <FormError message={error} />
      <Field id="email" label="E-mail">
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          required
        />
      </Field>
      <Field
        id="senha"
        label="Senha"
        extra={
          <Link href="/recuperar-senha" className="text-sm font-medium text-gold-ink hover:underline">
            Esqueci minha senha
          </Link>
        }
      >
        <PasswordInput id="senha" value={password} onChange={setPassword} autoComplete="current-password" />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        Entrar
      </Button>
      <GoogleButton next={next} />
      <p className="pt-2 text-center text-[0.95rem] text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href={`/cadastro${next !== "/inicio" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-gold-ink hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Criar conta

export function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (!authEnabled) return <AuthNotConfigured />;

  if (sentTo)
    return (
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold/12 text-gold">
          <MailCheck className="size-8" aria-hidden />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-semibold">Confirme seu e-mail</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Enviamos um link de confirmação para <strong className="text-foreground">{sentTo}</strong>. Abra a mensagem e
          toque no link para ativar sua conta. Se não encontrar, olhe também a pasta de spam.
        </p>
        <Button variant="outline" className="mt-6" render={<Link href="/entrar" />} nativeButton={false}>
          Voltar para entrar
        </Button>
      </div>
    );

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const pw = validarSenha(password);
        setPwError(pw);
        if (!name.trim() || !email.trim()) {
          setError("Preencha seu nome e e-mail.");
          return;
        }
        if (pw) return;
        setBusy(true);
        setError(null);
        const supabase = getSupabase()!;
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim().slice(0, 60) },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        setBusy(false);
        if (err) {
          setError(traduzirErro(err.message));
          return;
        }
        if (data.session) {
          await supabase.rpc("ensure_profile");
          toast.success("Conta criada. Seja bem-vindo!");
          router.replace(next);
          router.refresh();
          return;
        }
        setSentTo(email.trim());
      }}
    >
      <FormError message={error} />
      <Field id="nome" label="Seu primeiro nome">
        <Input
          id="nome"
          autoComplete="given-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Maria"
          maxLength={60}
          required
        />
      </Field>
      <Field id="email" label="E-mail">
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          required
        />
      </Field>
      <Field id="senha" label="Crie uma senha" error={pwError}>
        <PasswordInput id="senha" value={password} onChange={setPassword} autoComplete="new-password" invalid={!!pwError} />
        {!pwError ? (
          <p className="text-sm text-muted-foreground">Pelo menos {MIN_PASSWORD} caracteres, com letras e números.</p>
        ) : null}
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        Criar minha conta
      </Button>
      <GoogleButton next={next} />
      <p className="pt-2 text-center text-[0.95rem] text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-gold-ink hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Recuperar senha

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!authEnabled) return <AuthNotConfigured />;

  if (sent)
    return (
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-gold/12 text-gold">
          <MailCheck className="size-8" aria-hidden />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-semibold">Verifique seu e-mail</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Se existir uma conta com <strong className="text-foreground">{email.trim()}</strong>, você vai receber um link
          para criar uma nova senha. O link vale por pouco tempo.
        </p>
        <Button variant="outline" className="mt-6" render={<Link href="/entrar" />} nativeButton={false}>
          Voltar para entrar
        </Button>
      </div>
    );

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim()) {
          setError("Digite o e-mail da sua conta.");
          return;
        }
        setBusy(true);
        setError(null);
        const { error: err } = await getSupabase()!.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
        });
        setBusy(false);
        if (err) {
          setError(traduzirErro(err.message));
          return;
        }
        setSent(true);
      }}
    >
      <FormError message={error} />
      <Field id="email" label="E-mail da sua conta">
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          required
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        Enviar link de recuperação
      </Button>
      <p className="pt-2 text-center text-[0.95rem] text-muted-foreground">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="font-semibold text-gold-ink hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Nova senha (depois do link de recuperação)

export function ResetPasswordForm() {
  const router = useRouter();
  const user = useUser();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  if (!authEnabled) return <AuthNotConfigured />;
  if (user === undefined)
    return (
      <p className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Carregando…
      </p>
    );
  if (user === null)
    return (
      <div className="text-center">
        <p className="leading-relaxed text-muted-foreground">
          Este link expirou ou já foi usado. Peça um novo link para criar sua senha.
        </p>
        <Button className="mt-5" render={<Link href="/recuperar-senha" />} nativeButton={false}>
          Pedir novo link
        </Button>
      </div>
    );

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const pw = validarSenha(password);
        setPwError(pw);
        if (pw) return;
        setBusy(true);
        setError(null);
        const { error: err } = await getSupabase()!.auth.updateUser({ password });
        setBusy(false);
        if (err) {
          setError(traduzirErro(err.message));
          return;
        }
        toast.success("Senha alterada com sucesso");
        router.replace("/inicio");
        router.refresh();
      }}
    >
      <FormError message={error} />
      <p className="text-[0.95rem] text-muted-foreground">
        Conta: <strong className="text-foreground">{user.email}</strong>
      </p>
      <Field id="nova-senha" label="Nova senha" error={pwError}>
        <PasswordInput id="nova-senha" value={password} onChange={setPassword} autoComplete="new-password" invalid={!!pwError} />
        {!pwError ? (
          <p className="text-sm text-muted-foreground">Pelo menos {MIN_PASSWORD} caracteres, com letras e números.</p>
        ) : null}
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        Salvar nova senha
      </Button>
    </form>
  );
}
