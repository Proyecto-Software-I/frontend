"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAuthErrorMessage } from "../auth-error";
import { useAuth } from "../hooks/auth-provider";
import { ACTIVE_MEMBERSHIP_STATUS } from "../types/auth";

export function OrganizationSelector() {
  const { session, chooseOrganization } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const memberships = (session?.memberships ?? []).filter(
    (membership) => membership.status === ACTIVE_MEMBERSHIP_STATUS,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !selectedId) {
      if (pending) return;
      setError("Elegí una organización para continuar.");
      return;
    }

    setError(null);
    setPending(true);
    try {
      await chooseOrganization(selectedId);
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError, "selection"));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-foreground p-4 font-mono text-background sm:p-6">
      <Card className="w-full max-w-2xl border-background/10 bg-background/5 text-background ring-background/10">
        <CardHeader>
          <p className="text-sm font-semibold text-primary">LegacyLift</p>
          <CardTitle className="text-2xl">Elegí una organización</CardTitle>
            <p className="text-sm leading-6 text-background/68">
            Tu usuario pertenece a más de una organización. Seleccioná una para continuar.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert" aria-live="assertive">
                {error}
              </p>
            ) : null}
            {memberships.length === 0 ? (
                <p className="rounded-lg border border-background/10 p-4 text-sm text-background/68" role="status">
                No hay organizaciones activas disponibles.
              </p>
            ) : (
              <fieldset className="grid gap-3" disabled={pending}>
                <legend className="sr-only">Organizaciones disponibles</legend>
                {memberships.map((membership) => (
                  <label
                    key={membership.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                  >
                    <input
                      type="radio"
                      name="organization"
                      value={membership.organization.id}
                      checked={selectedId === membership.organization.id}
                      onChange={() => setSelectedId(membership.organization.id)}
                      className="mt-1 size-4 accent-primary"
                    />
                    <span className="grid gap-2">
                      <span className="font-medium">{membership.organization.name}</span>
                      <span className="flex flex-wrap gap-2">
                        {membership.roles.map((role) => (
                          <Badge key={role} variant="secondary">{role}</Badge>
                        ))}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
              <Button type="submit" disabled={selectedId === null || memberships.length === 0 || pending}>
              {pending ? "Seleccionando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
