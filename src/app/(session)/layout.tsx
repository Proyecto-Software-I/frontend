import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/hooks/auth-provider";
import { SessionBoundary } from "@/features/auth/components/session-boundary";

export default function SessionLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <AuthProvider>
      <SessionBoundary>{children}</SessionBoundary>
    </AuthProvider>
  );
}
