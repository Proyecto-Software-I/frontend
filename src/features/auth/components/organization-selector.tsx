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
      <Card className="w-full max-w-2xl border-background/20 bg-background/10 text-background ring-background/20">
        <CardHeader>
          <p className="text-sm font-semibold text-background">LegacyLift</p>
          <CardTitle className="text-2xl">Elegí una organización</CardTitle>
          <p className="text-sm leading-6 text-background/80">
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
              <p className="rounded-lg border border-background/20 p-4 text-sm text-background/80" role="status">
                No hay organizaciones activas disponibles.
              </p>
            ) : (
              <fieldset className="grid gap-3" disabled={pending}>
                <legend className="sr-only">Organizaciones disponibles</legend>
                {memberships.map((membership) => (
                  <label
                    key={membership.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-background transition has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 ${
                      pending
                        ? "pointer-events-none border-background/20 opacity-60"
                        : selectedId === membership.organization.id
                          ? "cursor-pointer border-background bg-background/15 ring-1 ring-background/30"
                          : "cursor-pointer border-background/30 hover:bg-background/10"
                    }`}
                    data-selected={selectedId === membership.organization.id}
                  >
                    <input
                      type="radio"
                      name="organization"
                      value={membership.organization.id}
                      checked={selectedId === membership.organization.id}
                      onChange={() => setSelectedId(membership.organization.id)}
                      className="mt-1 size-4 accent-background"
                    />
                    <span className="grid gap-2">
                      <span className="font-medium">{membership.organization.name}</span>
                      {selectedId === membership.organization.id ? (
                        <span className="text-sm text-background/80">Seleccionada</span>
                      ) : null}
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
            <Button type="submit" variant="secondary" disabled={selectedId === null || memberships.length === 0 || pending} aria-busy={pending} className="w-full disabled:opacity-70">
              {pending ? "Seleccionando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
