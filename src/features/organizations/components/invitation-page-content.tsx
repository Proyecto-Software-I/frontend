"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { ApiError } from "@/lib/api/api-error";

import { acceptInvitation } from "../api/organization-members-api";
import { useInvitationPreview, type InvitationPreviewStatus } from "../hooks/use-invitation-preview";
import type { InvitationPreview } from "../types/organizations";

export function InvitationPageContent({ token }: Readonly<{ token: string }>) {
  const previewState = useInvitationPreview(token);

  if (previewState.status === "loading") {
    return <InvitationShell><p role="status" aria-live="polite">Loading invitation...</p></InvitationShell>;
  }

  if (previewState.status !== "valid" || !previewState.preview) {
    return (
      <InvitationShell>
        <InvalidInvitationState status={invalidStatus(previewState.status)} onRetry={previewState.retry} />
      </InvitationShell>
    );
  }

  return <ValidInvitation token={token} preview={previewState.preview} />;
}

function invalidStatus(status: InvitationPreviewStatus): Exclude<InvitationPreviewStatus, "loading" | "valid"> {
  return status === "loading" || status === "valid" ? "error" : status;
}

function ValidInvitation({
  preview,
  token,
}: Readonly<{ preview: InvitationPreview; token: string }>) {
  const router = useRouter();
  const { chooseOrganization, getAccessToken, reloadSession, session, signOut, status } = useAuth();
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const acceptingRef = useRef(false);

  const signedIn = status === "authenticated" || status === "selection-required";
  const isMatchingAccount = signedIn && normalizeEmail(session?.user.email) === normalizeEmail(preview.email);
  const returnTo = `/invite/${encodeURIComponent(token)}`;

  async function finishOrganizationSetup() {
    setPending(true);
    setError(null);

    try {
      const refreshed = await reloadSession();
      const membership = refreshed.memberships.find(
        (candidate) =>
          candidate.status === "ACTIVE" &&
          candidate.organization.slug === preview.organization.slug,
      );

      if (!membership) {
        setError("Invitation accepted, but your organization access is still syncing. Retry setup shortly.");
        return;
      }

      await chooseOrganization(membership.organization.id);
      router.replace("/dashboard");
    } catch (requestError: unknown) {
      setError(getInvitationActionError(requestError));
    } finally {
      setPending(false);
    }
  }

  async function handleJoin() {
    if (pending || accepted || acceptingRef.current) return;
    const accessToken = getAccessToken();
    if (!accessToken) {
      setError("Your session is no longer available. Sign in again to continue.");
      return;
    }

    setPending(true);
    acceptingRef.current = true;
    setError(null);
    try {
      await acceptInvitation(accessToken, token);
      setAccepted(true);
      await finishOrganizationSetup();
    } catch (requestError: unknown) {
      setError(getInvitationActionError(requestError));
      acceptingRef.current = false;
      setPending(false);
    }
  }

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await signOut();
    } catch (requestError: unknown) {
      setError(getInvitationActionError(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <InvitationShell>
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">You&apos;ve been invited to join</p>
        <h1 className="text-3xl font-semibold tracking-tight">{preview.organization.name}</h1>
        <p className="text-muted-foreground">as {preview.email}</p>
        <p className="text-sm text-muted-foreground">Invitation expires {formatDate(preview.expiresAt)}.</p>
      </div>
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {!signedIn ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline"><Link href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}>Sign in</Link></Button>
          <Button asChild><Link href={`/auth/register?invitationToken=${encodeURIComponent(token)}`}>Create account and join organization</Link></Button>
        </div>
      ) : isMatchingAccount ? (
        <div className="grid gap-3">
          {accepted ? (
            <Button type="button" disabled={pending} onClick={() => void finishOrganizationSetup()}>
              {pending ? "Setting up organization..." : "Retry setup"}
            </Button>
          ) : (
            <Button type="button" disabled={pending} aria-busy={pending} onClick={() => void handleJoin()}>
              {pending ? "Joining organization..." : `Join ${preview.organization.name}`}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <p className="text-sm">This invitation was sent to {preview.email}. You are currently signed in as {session?.user.email ?? "another account"}.</p>
          <Button type="button" variant="outline" disabled={pending} onClick={() => void handleSignOut()}>
            {pending ? "Signing out..." : "Sign out / use another account"}
          </Button>
        </div>
      )}
    </InvitationShell>
  );
}

function InvalidInvitationState({
  onRetry,
  status,
}: Readonly<{
  onRetry: () => void;
  status: Exclude<InvitationPreviewStatus, "loading" | "valid">;
}>) {
  const messages: Record<typeof status, string> = {
    "not-found": "This invitation is no longer valid.",
    expired: "This invitation has expired.",
    revoked: "This invitation has been revoked.",
    accepted: "This invitation has already been accepted.",
    error: "We couldn't load this invitation.",
  };

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">{messages[status]}</h1>
      <p className="text-muted-foreground">Ask an organization administrator for a new invitation.</p>
      {status === "error" ? <Button type="button" onClick={onRetry}>Retry</Button> : null}
    </div>
  );
}

function InvitationShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardContent className="grid gap-6 p-6">{children}</CardContent>
      </Card>
    </main>
  );
}

function normalizeEmail(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

function getInvitationActionError(error: unknown): string {
  const code = error instanceof ApiError ? error.code : null;
  const messages: Record<string, string> = {
    INVITATION_EXPIRED: "This invitation has expired.",
    INVITATION_REVOKED: "This invitation has been revoked.",
    INVITATION_ALREADY_ACCEPTED: "This invitation has already been accepted.",
    INVITATION_EMAIL_MISMATCH: "This invitation was sent to another account.",
    MEMBER_ALREADY_EXISTS: "You already have access to this organization.",
    MEMBER_ACCESS_DENIED: "You do not have permission to join this organization.",
  };

  return (code && messages[code]) || "We couldn't complete this invitation action. Try again.";
}
