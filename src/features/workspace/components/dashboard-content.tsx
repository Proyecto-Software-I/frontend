"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/hooks/auth-provider";

import { getDisplayName } from "../lib/get-display-name";

export function DashboardContent() {
  const { session } = useAuth();

  if (!session?.activeOrganization || !session.activeMembership) {
    return null;
  }

  const displayName = getDisplayName(session.user);

  return (
    <div className="grid gap-8">
      <section aria-labelledby="dashboard-title" className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/65">
          Workspace
        </p>
        <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Bienvenido de nuevo, {displayName}
        </h1>
        <p className="text-lg text-background/65">{session.activeOrganization.name}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-background/20 bg-background/5 text-background ring-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-background/65">
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                business
              </span>
              Organización
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p className="text-2xl font-semibold">{session.activeOrganization.name}</p>
            <p className="text-background/65">Tu espacio de trabajo activo</p>
          </CardContent>
        </Card>

        <Card className="border-background/20 bg-background/5 text-background ring-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-background/65">
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                shield
              </span>
              Tu acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <ul className="flex flex-wrap gap-2" aria-label="Roles disponibles">
              {session.activeMembership.roles.length > 0 ? (
                session.activeMembership.roles.map((role) => (
                  <li key={role}>
                    <Badge
                      variant="outline"
                      className="border-background/20 bg-background/10 text-background"
                    >
                      {role}
                    </Badge>
                  </li>
                ))
              ) : (
                <li className="text-background/65">Sin roles asignados.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-background/20" />

      <section aria-labelledby="getting-started-title" className="grid gap-4">
        <h2 id="getting-started-title" className="text-2xl font-semibold">
          Primeros pasos
        </h2>
        <Card className="border-dashed border-background/30 bg-transparent text-background ring-0">
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-xl border border-background/25 bg-background/10">
              <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                rocket_launch
              </span>
            </span>
            <p className="text-lg font-medium">
              Creá tu primer proyecto de modernización
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/65">
              Próximamente
            </p>
            <Link
              className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              href="/health"
            >
              Ver estado del backend
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
