"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../hooks/auth-provider";

const protectedPaths = new Set(["/dashboard", "/auth/select-organization"]);
const entryPaths = new Set(["/auth/login", "/auth/register"]);

export function SessionBoundary({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { notice, status } = useAuth();
  const isProtected = protectedPaths.has(pathname);
  const isEntry = entryPaths.has(pathname);

  useEffect(() => {
    if (status === "bootstrapping") {
      return;
    }

    if (isProtected && status === "anonymous") {
      router.replace("/auth/login");
      return;
    }

    if (pathname === "/dashboard" && status === "selection-required") {
      router.replace("/auth/select-organization");
      return;
    }

    if (pathname === "/auth/select-organization" && status === "authenticated") {
      router.replace("/dashboard");
      return;
    }

    if (isEntry && (status === "authenticated" || status === "selection-required")) {
      router.replace(status === "selection-required" ? "/auth/select-organization" : "/dashboard");
    }
  }, [isEntry, isProtected, pathname, router, status]);

  if (status === "bootstrapping" || (isProtected && status === "anonymous")) {
    return <SessionLoading />;
  }

  if (
    (pathname === "/dashboard" && status === "selection-required") ||
    (pathname === "/auth/select-organization" && status === "authenticated") ||
    (isEntry && (status === "authenticated" || status === "selection-required"))
  ) {
    return <SessionLoading />;
  }

  if (pathname === "/auth/select-organization" && status === "error") {
    return <SessionError message={notice} />;
  }

  return children;
}

function SessionLoading() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        Restaurando sesión...
      </p>
    </main>
  );
}

function SessionError({ message }: Readonly<{ message: string | null }>) {
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
