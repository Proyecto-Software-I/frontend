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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof typeof values, string>>
  >({});
  const [pending, setPending] = useState(false);
  const displayedError = error ?? notice;

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors: Partial<Record<keyof typeof values, string>> = {};
    for (const [field, value] of Object.entries(values) as [keyof typeof values, string][]) {
      if (!value.trim()) {
        validationErrors[field] = "Completá este campo.";
      }
    }
    if (validationErrors.password === undefined && values.password.length < 8) {
      validationErrors.password = "Usá al menos 8 caracteres.";
    }
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Completá todos los campos.");
      return;
    }

    setPending(true);
    setFieldErrors({});
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
          <Field id="firstName" label="Nombre" value={values.firstName} onChange={(value) => update("firstName", value)} autoComplete="given-name" error={fieldErrors.firstName} describedBy={displayedError ? "register-form-error" : undefined} />
          <Field id="lastName" label="Apellido" value={values.lastName} onChange={(value) => update("lastName", value)} autoComplete="family-name" error={fieldErrors.lastName} describedBy={displayedError ? "register-form-error" : undefined} />
        </div>
        <Field id="email" label="Email" type="email" value={values.email} onChange={(value) => update("email", value)} autoComplete="email" error={fieldErrors.email} describedBy={displayedError ? "register-form-error" : undefined} />
        <Field id="password" label="Contraseña" type="password" value={values.password} onChange={(value) => update("password", value)} autoComplete="new-password" error={fieldErrors.password} describedBy={displayedError ? "register-form-error" : undefined} />
        <Field id="organizationName" label="Nombre de la organización" value={values.organizationName} onChange={(value) => update("organizationName", value)} autoComplete="organization" error={fieldErrors.organizationName} describedBy={displayedError ? "register-form-error" : undefined} />
        <Button type="submit" variant="secondary" disabled={pending} aria-busy={pending} className="mt-1 w-full disabled:opacity-70">
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés una cuenta?{" "}
          <Link className="font-medium text-background underline-offset-4 hover:text-background hover:underline active:opacity-80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" href="/auth/login">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
