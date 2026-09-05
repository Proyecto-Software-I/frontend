"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvitationPreview } from "@/features/organizations/hooks/use-invitation-preview";

import { RegisterForm } from "./register-form";

export function InvitationRegisterBoundary({ token }: Readonly<{ token: string }>) {
  const { preview, retry, status } = useInvitationPreview(token);

  if (status === "loading") {
    return <RegisterInvitationState message="Loading invitation..." />;
  }

  if (status !== "valid" || !preview) {
    return (
      <RegisterInvitationState
        message="This invitation is no longer valid. Ask an organization administrator for a new invitation."
        onRetry={status === "error" ? retry : undefined}
      />
    );
  }

  return (
    <RegisterForm invitation={{
      invitationToken: token,
      email: preview.email,
      organizationName: preview.organization.name,
    }} />
  );
}

function RegisterInvitationState({
  message,
  onRetry,
}: Readonly<{ message: string; onRetry?: () => void }>) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardContent className="grid gap-4 p-6">
          <p className="text-sm" role={onRetry ? "alert" : "status"}>{message}</p>
          {onRetry ? <Button type="button" onClick={onRetry}>Retry</Button> : null}
        </CardContent>
      </Card>
    </main>
  );
}
