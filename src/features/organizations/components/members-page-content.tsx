"use client";

import { useState, type FormEvent } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useOrganizationMembersReadState } from "../hooks/use-organization-members-read-state";
import type { OrganizationInvitation, OrganizationMember } from "../types/organizations";

export function MembersPageContent() {
  const state = useOrganizationMembersReadState();

  if (!state.canReadMembers) {
    return (
      <section aria-labelledby="members-title" className="grid gap-4">
        <PageHeader />
        <Card className="border-background/20 bg-background/5 text-background ring-0">
          <CardContent className="p-6">
            <p className="text-sm" role="alert">
              No tienes permiso para ver los miembros de esta organización.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        canManageMembers={state.canManageMembers}
        createInvitation={state.createInvitation}
      />
      <MembersSection
        activeOrganizationName={state.activeOrganizationName}
        canManageMembers={state.canManageMembers}
        error={state.members.error}
        mutation={state.memberMutation}
        members={state.visibleMembers}
        onRetry={state.retryMembers}
        status={state.members.status}
      />
      <PendingInvitationsSection
        canManageMembers={state.canManageMembers}
        error={state.invitations.error}
        invitations={state.pendingInvitations}
        onRetry={state.retryInvitations}
        revoke={state.revokeInvitation}
        status={state.invitations.status}
      />
    </div>
  );
}

function PageHeader({
  canManageMembers = false,
  createInvitation,
}: Readonly<{
  canManageMembers?: boolean;
  createInvitation?: CreateInvitationState;
}>) {
  return (
    <section aria-labelledby="members-title" className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/65">
           Configuración
        </p>
        <h1 id="members-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
           Miembros
        </h1>
        <p className="text-lg text-background/65">
           Administra las personas que tienen acceso a esta organización.
        </p>
      </div>
      {canManageMembers && createInvitation ? (
        <InviteMemberDialog createInvitation={createInvitation} />
      ) : null}
    </section>
  );
}

function MembersSection({
  activeOrganizationName,
  canManageMembers,
  error,
  mutation,
  members,
  onRetry,
  status,
}: Readonly<{
  activeOrganizationName: string | null;
  canManageMembers: boolean;
  error: string | null;
  mutation: MemberMutationState;
  members: OrganizationMember[];
  onRetry: () => void;
  status: "idle" | "loading" | "success" | "error";
}>) {
  return (
    <section aria-labelledby="members-list-title" className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="members-list-title" className="text-2xl font-semibold">
          Miembros de la organización
        </h2>
      </div>
      <Card className="border-background/20 bg-background/5 text-background ring-0">
        <CardContent className="p-0">
          {status === "loading" || status === "idle" ? (
            <LoadingState message="Cargando miembros..." />
          ) : null}
          {status === "error" ? (
            <ErrorState message={error} onRetry={onRetry} retryLabel="Reintentar carga de miembros" />
          ) : null}
          {status === "success" && members.length === 0 ? <NoMembersState /> : null}
          {status === "success" && members.length === 1 ? (
            <OnlyMemberState member={members[0]} />
          ) : null}
          {status === "success" && members.length > 0 ? (
            <MembersList
              activeOrganizationName={activeOrganizationName}
              canManageMembers={canManageMembers}
              members={members}
              mutation={mutation}
            />
          ) : null}
        </CardContent>
      </Card>
      {mutation.error ? (
        <p className="text-sm text-destructive" role="alert">
          {mutation.error}
        </p>
      ) : null}
    </section>
  );
}

function MembersList({
  activeOrganizationName,
  canManageMembers,
  members,
  mutation,
}: Readonly<{
  activeOrganizationName: string | null;
  canManageMembers: boolean;
  members: OrganizationMember[];
  mutation: MemberMutationState;
}>) {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Miembros de la organización</caption>
          <thead className="border-b border-background/15 text-xs uppercase tracking-[0.16em] text-background/65">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
              <th scope="col" className="px-4 py-3 font-medium">Correo electrónico</th>
              <th scope="col" className="px-4 py-3 font-medium">Rol(es)</th>
              <th scope="col" className="px-4 py-3 font-medium">Estado</th>
              {canManageMembers ? <th scope="col" className="px-4 py-3 font-medium">Acciones</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-background/10">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-4">
                  <MemberIdentity member={member} />
                </td>
                <td className="px-4 py-4 text-background/75">{member.user.email}</td>
                <td className="px-4 py-4"><Roles roles={member.roles} /></td>
                <td className="px-4 py-4"><StatusBadge status={member.status} /></td>
                {canManageMembers ? (
                  <td className="px-4 py-4">
                    <MemberActions
                      activeOrganizationName={activeOrganizationName}
                      member={member}
                      mutation={mutation}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <ul className="grid gap-3 p-4 md:hidden" aria-label="Miembros de la organización">
        {members.map((member) => (
          <li key={member.id} className="rounded-xl border border-background/15 bg-background/5 p-4">
            <div className="grid gap-3">
              <MemberIdentity member={member} />
              <dl className="grid gap-2 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-background/55">Correo electrónico</dt>
                  <dd className="break-words text-background/75">{member.user.email}</dd>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-background/55">Rol(es)</dt>
                  <dd><Roles roles={member.roles} /></dd>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-background/55">Estado</dt>
                  <dd><StatusBadge status={member.status} /></dd>
                </div>
              </dl>
              {canManageMembers ? (
                <MemberActions
                  activeOrganizationName={activeOrganizationName}
                  member={member}
                  mutation={mutation}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function PendingInvitationsSection({
  canManageMembers,
  error,
  invitations,
  onRetry,
  revoke,
  status,
}: Readonly<{
  canManageMembers: boolean;
  error: string | null;
  invitations: OrganizationInvitation[];
  onRetry: () => void;
  revoke: RevokeInvitationState;
  status: "idle" | "loading" | "success" | "error";
}>) {
  return (
    <section aria-labelledby="pending-invitations-title" className="grid gap-3">
      <h2 id="pending-invitations-title" className="text-2xl font-semibold">
        Invitaciones pendientes
      </h2>
      <Card className="border-background/20 bg-background/5 text-background ring-0">
        <CardContent className="p-0">
          {status === "loading" || status === "idle" ? (
            <LoadingState message="Cargando invitaciones pendientes..." />
          ) : null}
          {status === "error" ? (
            <ErrorState message={error} onRetry={onRetry} retryLabel="Reintentar carga de invitaciones" />
          ) : null}
          {status === "success" && invitations.length === 0 ? (
            <p className="p-6 text-sm text-background/75">No hay invitaciones pendientes.</p>
          ) : null}
          {status === "success" && invitations.length > 0 ? (
            <ul className="divide-y divide-background/10" aria-label="Invitaciones pendientes">
              {invitations.map((invitation) => (
                <li key={invitation.id} className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InvitationField label="Correo electrónico" value={invitation.email} />
                  <InvitationField label="Estado" value={formatInvitationStatus(invitation.status)} />
                  <InvitationField label="Vencimiento" value={formatDate(invitation.expiresAt)} />
                  <InvitationField label="Invitado por" value={displayInviter(invitation)} />
                  <InvitationField label="Rol" value={displayProposedRole(invitation)} />
                  {canManageMembers ? (
                    <RevokeInvitationAction invitation={invitation} revoke={revoke} />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
      {revoke.error ? (
        <p className="text-sm text-destructive" role="alert">
          {revoke.error}
        </p>
      ) : null}
    </section>
  );
}

interface CreateInvitationState {
  pending: boolean;
  error: string | null;
  acceptanceUrl: string | null;
  submit: (email: string) => Promise<boolean>;
  clear: () => void;
}

interface RevokeInvitationState {
  pendingId: string | null;
  error: string | null;
  submit: (invitationId: string) => Promise<boolean>;
  clearError: () => void;
}

interface MemberMutationState {
  pendingId: string | null;
  error: string | null;
  suspend: (membershipId: string) => Promise<boolean>;
  reactivate: (membershipId: string) => Promise<boolean>;
  remove: (membershipId: string) => Promise<boolean>;
  clearError: () => void;
}

function InviteMemberDialog({
  createInvitation,
}: Readonly<{ createInvitation: CreateInvitationState }>) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEmail("");
      setFieldError(null);
      setCopyStatus(null);
      createInvitation.clear();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createInvitation.pending) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setFieldError("Ingresa un correo electrónico válido.");
      return;
    }

    setFieldError(null);
    setCopyStatus(null);
    const created = await createInvitation.submit(normalizedEmail);
    if (created) setEmail("");
  }

  async function copyInvitationLink() {
    if (!createInvitation.acceptanceUrl) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable.");
      }
      await navigator.clipboard.writeText(createInvitation.acceptanceUrl);
      setCopyStatus("Enlace de invitación copiado.");
    } catch {
      setCopyStatus("No pudimos copiar el enlace. Selecciónalo y cópialo manualmente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button type="button" onClick={() => setOpen(true)}>
        Invitar miembro
      </Button>
      <DialogContent showCloseButton={false} className="max-h-[calc(100svh-2rem)] overflow-y-auto border border-background/20 bg-foreground font-sans text-background ring-background/10">
        {createInvitation.acceptanceUrl ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-sans text-background">Invitación creada</DialogTitle>
              <DialogDescription className="text-background/65">
                Comparte este enlace seguro con la persona invitada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <label className="grid gap-2 text-sm font-medium">
                Enlace de invitación
                <Input className="border-background/20 bg-background/10 text-background" readOnly value={createInvitation.acceptanceUrl} />
              </label>
              {copyStatus ? (
                <p className="text-sm text-background/75" role="status" aria-live="polite">
                  {copyStatus}
                </p>
              ) : null}
            </div>
            <DialogFooter className="border-background/20 bg-background/5">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-background/20 bg-background/10 text-background hover:bg-background/15">Cerrar</Button>
              </DialogClose>
              <Button type="button" onClick={() => void copyInvitationLink()}>
                Copiar enlace de invitación
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
            <DialogHeader>
              <DialogTitle className="font-sans text-background">Invitar miembro</DialogTitle>
              <DialogDescription className="text-background/65">
                Crea un enlace de invitación de un solo uso para un nuevo miembro de la organización.
              </DialogDescription>
            </DialogHeader>
            <label className="grid gap-2 text-sm font-medium" htmlFor="invite-member-email">
              Correo electrónico
              <Input
                id="invite-member-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? "invite-member-email-error" : undefined}
                disabled={createInvitation.pending}
                className="border-background/20 bg-background/10 text-background"
              />
            </label>
            {fieldError ? (
              <p id="invite-member-email-error" className="text-sm text-destructive" role="alert">
                {fieldError}
              </p>
            ) : null}
            {createInvitation.error ? (
              <p className="text-sm text-destructive" role="alert">
                {createInvitation.error}
              </p>
            ) : null}
            <DialogFooter className="border-background/20 bg-background/5">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-background/20 bg-background/10 text-background hover:bg-background/15" disabled={createInvitation.pending}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={createInvitation.pending}>
                {createInvitation.pending ? "Creando invitación..." : "Crear invitación"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RevokeInvitationAction({
  invitation,
  revoke,
}: Readonly<{
  invitation: OrganizationInvitation;
  revoke: RevokeInvitationState;
}>) {
  const [open, setOpen] = useState(false);
  const pending = revoke.pendingId === invitation.id;

  return (
    <div className="self-end">
      <Button type="button" variant="destructive" onClick={() => setOpen(true)} disabled={pending}>
        {pending ? "Revocando..." : "Revocar"}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto border border-background/20 bg-foreground font-sans text-background ring-background/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-background">¿Revocar invitación?</AlertDialogTitle>
            <AlertDialogDescription className="text-background/65">
              La invitación para {invitation.email} dejará de ser válida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-background/20 bg-background/5">
            <AlertDialogCancel className="border-background/20 bg-background/10 text-background hover:bg-background/15" disabled={pending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => {
                void revoke.submit(invitation.id).then((success) => {
                  if (success) setOpen(false);
                });
              }}
            >
              {pending ? "Revocando..." : "Revocar invitación"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MemberActions({
  activeOrganizationName,
  member,
  mutation,
}: Readonly<{
  activeOrganizationName: string | null;
  member: OrganizationMember;
  mutation: MemberMutationState;
}>) {
  const pending = mutation.pendingId === member.id;

  if (member.status === "REMOVED") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {member.status === "ACTIVE" ? (
        <ConfirmMemberAction
          actionLabel="Suspender"
          confirmLabel="Suspender miembro"
          description={`${displayMemberName(member)} perderá el acceso hasta que sea reactivado.`}
          disabled={pending}
          onConfirm={() => mutation.suspend(member.id)}
          pendingLabel="Suspendiendo..."
          title="¿Suspender miembro?"
        />
      ) : null}
      {member.status === "SUSPENDED" ? (
        <Button
          type="button"
          variant="secondary"
          className="border-background/20 bg-background/10 text-background hover:bg-background/15"
          disabled={pending}
          onClick={() => void mutation.reactivate(member.id)}
        >
          {pending ? "Reactivando..." : "Reactivar"}
        </Button>
      ) : null}
      <ConfirmMemberAction
        actionLabel="Eliminar"
        confirmLabel="Eliminar miembro"
        description="Perderá el acceso a esta organización."
        disabled={pending}
        onConfirm={() => mutation.remove(member.id)}
        pendingLabel="Eliminando..."
        title={`¿Eliminar a ${displayMemberName(member)} de ${activeOrganizationName ?? "esta organización"}?`}
        variant="destructive"
      />
    </div>
  );
}

function ConfirmMemberAction({
  actionLabel,
  confirmLabel,
  description,
  disabled,
  onConfirm,
  pendingLabel,
  title,
  variant = "secondary",
}: Readonly<{
  actionLabel: string;
  confirmLabel: string;
  description: string;
  disabled: boolean;
  onConfirm: () => Promise<boolean>;
  pendingLabel: string;
  title: string;
  variant?: "secondary" | "destructive";
}>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant={variant} disabled={disabled} onClick={() => setOpen(true)}>
        {disabled ? pendingLabel : actionLabel}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto border border-background/20 bg-foreground font-sans text-background ring-background/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-background">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-background/65">{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-background/20 bg-background/5">
            <AlertDialogCancel className="border-background/20 bg-background/10 text-background hover:bg-background/15" disabled={disabled}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant={variant}
              className={variant === "secondary" ? "border-background/20 bg-background/10 text-background hover:bg-background/15" : undefined}
              disabled={disabled}
              onClick={() => {
                void onConfirm().then((success) => {
                  if (success) setOpen(false);
                });
              }}
            >
              {disabled ? pendingLabel : confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MemberIdentity({ member }: Readonly<{ member: OrganizationMember }>) {
  const name = displayMemberName(member);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-background/20 bg-background/10 text-sm font-semibold"
        aria-hidden="true"
      >
        {getInitials(name)}
      </span>
      <span className="min-w-0 font-medium">{name}</span>
    </div>
  );
}

function Roles({ roles }: Readonly<{ roles: string[] }>) {
  if (roles.length === 0) {
    return <span className="text-background/65">Sin roles asignados.</span>;
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Roles">
      {roles.map((role) => (
        <li key={role}>
          <Badge variant="outline" className="border-background/20 bg-background/10 text-background">
            {role}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: Readonly<{ status: OrganizationMember["status"] }>) {
  return (
    <Badge variant="outline" className="border-background/20 bg-background/10 text-background">
      {formatMemberStatus(status)}
    </Badge>
  );
}

function LoadingState({ message }: Readonly<{ message: string }>) {
  return <p className="p-6 text-sm text-background/75" role="status" aria-live="polite">{message}</p>;
}

function ErrorState({
  message,
  onRetry,
  retryLabel,
}: Readonly<{ message: string | null; onRetry: () => void; retryLabel: string }>) {
  return (
    <div className="grid gap-3 p-6" role="alert">
      <p className="text-sm text-destructive">
        {message ?? "No fue posible cargar esta sección. Intentá nuevamente."}
      </p>
      <Button type="button" variant="secondary" className="w-fit" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}

function NoMembersState() {
  return <p className="p-6 text-sm text-background/75">No hay miembros disponibles en esta organización.</p>;
}

function OnlyMemberState({ member }: Readonly<{ member: OrganizationMember }>) {
  return (
    <div className="grid gap-4 p-6">
      <MemberIdentity member={member} />
      <div className="grid gap-1 text-sm text-background/75">
        <p>Eres el único miembro de esta organización.</p>
        <p>Invita a tu equipo cuando estés listo.</p>
      </div>
    </div>
  );
}

function InvitationField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-background/55">{label}</p>
      <p className="break-words text-sm text-background">{value}</p>
    </div>
  );
}

function displayMemberName(member: OrganizationMember): string {
  return (
    member.user.displayName ||
    [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") ||
    member.user.email
  );
}

function displayInviter(invitation: OrganizationInvitation): string {
  return invitation.invitedBy?.displayName || "Miembro de la organización";
}

function displayProposedRole(invitation: OrganizationInvitation): string {
  return invitation.proposedRole?.name ?? invitation.proposedRole?.key ?? "Sin rol propuesto";
}

function formatMemberStatus(status: OrganizationMember["status"]): string {
  return {
    INVITED: "Invitado",
    ACTIVE: "Activo",
    SUSPENDED: "Suspendido",
    REMOVED: "Eliminado",
  }[status];
}

function formatInvitationStatus(status: OrganizationInvitation["status"]): string {
  return { PENDING: "Pendiente", EXPIRED: "Expirada", REVOKED: "Revocada", ACCEPTED: "Aceptada" }[status];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getInitials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}