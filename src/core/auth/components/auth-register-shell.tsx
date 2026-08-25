import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export function AuthRegisterSteps({
  steps,
  currentStep = 0,
}: {
  steps: readonly string[];
  currentStep?: number;
}) {
  return (
    <ol className="flex border-b border-border sm:grid sm:grid-cols-3">
      {steps.map((step, index) => {
        const current = index === currentStep;
        return (
          <li
            key={step}
            aria-current={current ? "step" : undefined}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2.5 sm:px-4",
              index < steps.length - 1 && "border-r border-border",
              current ? "flex-1 bg-brand-subtle" : "shrink-0",
            )}
          >
            {current ? (
              <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden />
            ) : null}
            <span
              className={cn(
                "ui-metric flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                current
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "truncate text-xs",
                current
                  ? "font-semibold text-foreground"
                  : "hidden font-medium text-muted-foreground sm:inline",
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function AuthRegisterFrame({
  backTo,
  backLabel = "Voltar ao login",
  eyebrow,
  title,
  description,
  steps,
  currentStep = 0,
  children,
}: {
  backTo: string;
  backLabel?: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  steps: readonly string[];
  currentStep?: number;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>

      <div className="mt-4 sm:mt-5">
        <p className="ui-eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-balance text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{description}</p>
      </div>

      <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <AuthRegisterSteps steps={steps} currentStep={currentStep} />
        {children}
      </section>
    </div>
  );
}

export function AuthRegisterSection({
  legend,
  bordered = false,
  children,
  footer,
}: {
  legend: string;
  bordered?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <fieldset className={cn("p-4 sm:p-5", bordered && "border-t border-border")}>
      <legend className="ui-microlabel">{legend}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
      {footer}
    </fieldset>
  );
}

export function AuthRegisterLegal({
  checkboxProps,
  error,
  alert,
  children,
}: {
  checkboxProps: ComponentProps<"input">;
  error?: string;
  alert?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 border-t border-border p-4 sm:p-5">
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border p-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-150 hover:border-brand-border hover:bg-brand-subtle">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
          {...checkboxProps}
        />
        <span>{children}</span>
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {alert}
    </div>
  );
}

export function AuthRegisterSubmitBar({
  loginTo,
  children,
}: {
  loginTo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border bg-muted p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      {children}
      <p className="text-sm text-muted-foreground">
        Já possui uma conta?{" "}
        <Link to={loginTo} className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

export function AuthRegisterSuccess({
  email,
  loginTo,
  nextSteps,
  onResend,
  resendPending,
  resendMessage,
}: {
  email: string;
  loginTo: string;
  nextSteps: readonly string[];
  onResend: () => void;
  resendPending: boolean;
  resendMessage: string | null;
}) {
  return (
    <div className="mx-auto max-w-md">
      <p className="ui-eyebrow">Cadastro enviado</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground">
        Confirme seu <span className="text-primary">e-mail</span>
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Enviamos um link para <span className="font-semibold text-foreground">{email}</span>.
      </p>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-elevated">
        <ol className="space-y-3">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="ui-icon-box ui-metric h-6 w-6 shrink-0 rounded-full text-[11px] font-bold">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-5 space-y-2.5">
          <Button asChild className="h-11 w-full" size="lg">
            <Link to={loginTo}>Voltar para login</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={resendPending}
            onClick={() => void onResend()}
          >
            {resendPending ? "Reenviando..." : "Reenviar confirmação"}
          </Button>
          {resendMessage ? (
            <p className="text-center text-sm text-muted-foreground">{resendMessage}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function AuthRegisterTermsLinks() {
  return (
    <>
      Li e aceito os{" "}
      <Link
        to={ROUTES.termos}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary hover:underline"
      >
        Termos de Uso
      </Link>
      , a{" "}
      <Link
        to={ROUTES.privacy}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary hover:underline"
      >
        Política de Privacidade
      </Link>{" "}
      e a{" "}
      <Link
        to={ROUTES.lgpd}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary hover:underline"
      >
        LGPD
      </Link>
      .
    </>
  );
}
