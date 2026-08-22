"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAuthErrorMessage } from "../auth-error";
import { useAuth } from "../hooks/auth-provider";

export function Dashboard() {
  const { session, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!session || !session.activeOrganization || !session.activeMembership) {
    return null;
  }

  async function handleLogout() {
    setPending(true);
    setError(null);
    try {
      await signOut();
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError, "logout"));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-svh bg-foreground p-4 font-mono text-background sm:p-6">
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">LegacyLift</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <Button type="button" variant="outline" onClick={() => void handleLogout()} disabled={pending}>
            {pending ? "Cerrando sesión..." : "Cerrar sesión"}
          </Button>
        </header>
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert" aria-live="assertive">
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-background/10 bg-background/5 text-background ring-background/10 md:col-span-2">
            <CardHeader>
              <CardTitle>Usuario</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p className="font-medium">{session.user.displayName ?? `${session.user.firstName ?? ""} ${session.user.lastName ?? ""}`.trim()}</p>
              <p className="text-muted-foreground">{session.user.email}</p>
            </CardContent>
          </Card>
          <Card className="border-background/10 bg-background/5 text-background ring-background/10">
            <CardHeader>
              <CardTitle>Organización activa</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p className="font-medium">{session.activeOrganization.name}</p>
              <div className="flex flex-wrap gap-2">
                {session.activeMembership.roles.map((role) => <Badge key={role}>{role}</Badge>)}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="border-background/10 bg-background/5 text-background ring-background/10">
          <CardHeader><CardTitle>Diagnóstico</CardTitle></CardHeader>
          <CardContent>
            <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/health">
              Ver estado del backend
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
