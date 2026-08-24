"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/auth-provider";

export function WorkspaceBoundary({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const { notice, status, session } = useAuth();
  const hasActiveOrganization = Boolean(
    session?.activeOrganization && session.activeMembership,
  );

  useEffect(() => {
    if (status === "bootstrapping") {
      return;
    }

    if (status === "anonymous") {
      router.replace("/auth/login");
      return;
    }

    if (status === "selection-required" || !hasActiveOrganization) {
      router.replace("/auth/select-organization");
    }
  }, [hasActiveOrganization, router, status]);

  if (status === "bootstrapping") {
    return <WorkspaceLoading message="Restaurando sesión..." />;
  }

  if (status === "anonymous") {
    return <WorkspaceLoading message="Redirigiendo al inicio de sesión..." />;
  }

  if (status === "error") {
    return <WorkspaceError message={notice} />;
  }

  if (status === "selection-required" || !hasActiveOrganization) {
    return (
      <WorkspaceLoading message="Redirigiendo a la selección de organización..." />
    );
  }

  return children;
}

function WorkspaceLoading({ message }: Readonly<{ message: string }>) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {message}
      </p>
    </main>
  );
}

function WorkspaceError({ message }: Readonly<{ message: string | null }>) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="grid max-w-md gap-4 text-center">
        <p className="text-sm text-destructive" role="alert">
          {message ?? "No fue posible restaurar la sesión. Ingresá nuevamente."}
        </p>
        <Link
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          href="/auth/login"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    </main>
  );
}
