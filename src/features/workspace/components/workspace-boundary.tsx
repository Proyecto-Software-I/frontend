"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/auth-provider";

export function WorkspaceBoundary({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const { status, session } = useAuth();
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
