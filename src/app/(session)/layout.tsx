import type { ReactNode } from "react";
import { Suspense } from "react";

import { AuthProvider } from "@/features/auth/hooks/auth-provider";
import { SessionBoundary } from "@/features/auth/components/session-boundary";

export default function SessionLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AuthProvider>
      <Suspense fallback={<SessionFallback />}>
        <SessionBoundary>{children}</SessionBoundary>
      </Suspense>
    </AuthProvider>
  );
}

function SessionFallback() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        Restaurando sesión...
      </p>
    </main>
  );
}
