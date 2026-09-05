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
    return <InvitationShell><p role="status" aria-live="polite">Cargando invitación...</p></InvitationShell>;
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
        setError("La invitación fue aceptada, pero el acceso a tu organización aún se está sincronizando. Reintenta la configuración en unos momentos.");
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
      setError("Tu sesión ya no está disponible. Inicia sesión nuevamente para continuar.");
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
        <p className="text-sm text-muted-foreground">Has sido invitado a unirte a</p>
        <h1 className="text-3xl font-semibold tracking-tight">{preview.organization.name}</h1>
        <p className="text-muted-foreground">como {preview.email}</p>
        <p className="text-sm text-muted-foreground">La invitación vence {formatDate(preview.expiresAt)}.</p>
      </div>
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {!signedIn ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline"><Link href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}>Iniciar sesión</Link></Button>
          <Button asChild><Link href={`/auth/register?invitationToken=${encodeURIComponent(token)}`}>Crear cuenta y unirme a la organización</Link></Button>
        </div>
      ) : isMatchingAccount ? (
        <div className="grid gap-3">
          {accepted ? (
            <Button type="button" disabled={pending} onClick={() => void finishOrganizationSetup()}>
              {pending ? "Configurando organización..." : "Reintentar configuración"}
            </Button>
          ) : (
            <Button type="button" disabled={pending} aria-busy={pending} onClick={() => void handleJoin()}>
              {pending ? "Uniéndose a la organización..." : `Unirme a ${preview.organization.name}`}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <p className="text-sm">Esta invitación fue enviada a {preview.email}. Actualmente has iniciado sesión como {session?.user.email ?? "otra cuenta"}.</p>
          <Button type="button" variant="outline" disabled={pending} onClick={() => void handleSignOut()}>
            {pending ? "Cerrando sesión..." : "Cerrar sesión / usar otra cuenta"}
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
    "not-found": "Esta invitación ya no es válida.",
    expired: "Esta invitación ha expirado.",
    revoked: "Esta invitación ha sido revocada.",
    accepted: "Esta invitación ya fue aceptada.",
    error: "No pudimos cargar esta invitación.",
  };

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">{messages[status]}</h1>
      <p className="text-muted-foreground">Solicita una nueva invitación a un administrador de la organización.</p>
      {status === "error" ? <Button type="button" onClick={onRetry}>Reintentar</Button> : null}
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
  return new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

function getInvitationActionError(error: unknown): string {
  const code = error instanceof ApiError ? error.code : null;
  const messages: Record<string, string> = {
    INVITATION_EXPIRED: "Esta invitación ha expirado.",
    INVITATION_REVOKED: "Esta invitación ha sido revocada.",
    INVITATION_ALREADY_ACCEPTED: "Esta invitación ya fue aceptada.",
    INVITATION_EMAIL_MISMATCH: "Esta invitación fue enviada a otra cuenta.",
    MEMBER_ALREADY_EXISTS: "Ya tienes acceso a esta organización.",
    MEMBER_ACCESS_DENIED: "No tienes permiso para unirte a esta organización.",
  };

  return (code && messages[code]) || "No pudimos completar esta acción de invitación. Inténtalo nuevamente.";
}
