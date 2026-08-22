"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { getAuthErrorMessage } from "../auth-error";
import { useAuth } from "../hooks/auth-provider";
import { AuthShell, Field } from "./auth-shell";

export function RegisterForm() {
  const { signUp, notice, clearNotice } = useAuth();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const displayedError = error ?? notice;

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Object.values(values).some((value) => !value.trim())) {
      setError("Completá todos los campos.");
      return;
    }
    if (values.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setPending(true);
    setError(null);
    clearNotice();
    try {
      await signUp(values);
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError, "register"));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Crear cuenta"
      description="Registrá tu usuario y la primera organización."
    >
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        {displayedError ? (
            <p id="register-form-error" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert" aria-live="assertive">
            {displayedError}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="firstName" label="Nombre" value={values.firstName} onChange={(value) => update("firstName", value)} autoComplete="given-name" describedBy={displayedError ? "register-form-error" : undefined} />
          <Field id="lastName" label="Apellido" value={values.lastName} onChange={(value) => update("lastName", value)} autoComplete="family-name" describedBy={displayedError ? "register-form-error" : undefined} />
        </div>
        <Field id="email" label="Email" type="email" value={values.email} onChange={(value) => update("email", value)} autoComplete="email" describedBy={displayedError ? "register-form-error" : undefined} />
        <Field id="password" label="Contraseña" type="password" value={values.password} onChange={(value) => update("password", value)} autoComplete="new-password" describedBy={displayedError ? "register-form-error" : undefined} />
        <Field id="organizationName" label="Nombre de la organización" value={values.organizationName} onChange={(value) => update("organizationName", value)} autoComplete="organization" describedBy={displayedError ? "register-form-error" : undefined} />
        <Button type="submit" disabled={pending} className="mt-1 w-full">
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés una cuenta?{" "}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/auth/login">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
