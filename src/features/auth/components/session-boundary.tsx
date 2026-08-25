"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../hooks/auth-provider";

const protectedPaths = new Set(["/dashboard", "/auth/select-organization"]);
const entryPaths = new Set(["/auth/login", "/auth/register"]);

export function SessionBoundary({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
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
