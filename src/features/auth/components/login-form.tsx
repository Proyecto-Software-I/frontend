"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { getAuthErrorMessage } from "../auth-error";
import { useAuth } from "../hooks/auth-provider";
import { AuthShell, Field } from "./auth-shell";

export function LoginForm() {
  const { signIn, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const displayedError = error ?? notice;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Ingresá tu email y contraseña.");
      return;
    }

    setPending(true);
    setError(null);
    clearNotice();
    try {
      await signIn({ email, password });
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError, "login"));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      description="Ingresá para continuar con tu organización activa."
    >
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {displayedError ? (
            <p id="login-form-error" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert" aria-live="assertive">
            {displayedError}
          </p>
        ) : null}
        <Field
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          describedBy={displayedError ? "login-form-error" : undefined}
        />
        <Field
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          describedBy={displayedError ? "login-form-error" : undefined}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Ingresando..." : "Ingresar"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ¿Todavía no tenés una cuenta?{" "}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/auth/register">
            Registrate
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
