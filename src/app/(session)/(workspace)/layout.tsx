import type { ReactNode } from "react";

import { WorkspaceBoundary } from "@/features/workspace/components/workspace-boundary";
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <WorkspaceBoundary>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceBoundary>
  );
}
