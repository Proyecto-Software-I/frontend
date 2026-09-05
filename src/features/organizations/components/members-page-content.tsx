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
              You do not have permission to view organization members.
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
          Settings
        </p>
        <h1 id="members-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Members
        </h1>
        <p className="text-lg text-background/65">
          Manage the people who have access to this organization.
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
          Organization members
        </h2>
      </div>
      <Card className="border-background/20 bg-background/5 text-background ring-0">
        <CardContent className="p-0">
          {status === "loading" || status === "idle" ? (
            <LoadingState message="Loading members..." />
          ) : null}
          {status === "error" ? (
            <ErrorState message={error} onRetry={onRetry} retryLabel="Retry members" />
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
          <caption className="sr-only">Organization members</caption>
          <thead className="border-b border-background/15 text-xs uppercase tracking-[0.16em] text-background/65">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Role(s)</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              {canManageMembers ? <th scope="col" className="px-4 py-3 font-medium">Actions</th> : null}
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
      <ul className="grid gap-3 p-4 md:hidden" aria-label="Organization members">
        {members.map((member) => (
          <li key={member.id} className="rounded-xl border border-background/15 bg-background/5 p-4">
            <div className="grid gap-3">
              <MemberIdentity member={member} />
              <dl className="grid gap-2 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-background/55">Email</dt>
                  <dd className="break-words text-background/75">{member.user.email}</dd>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-background/55">Role(s)</dt>
                  <dd><Roles roles={member.roles} /></dd>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-background/55">Status</dt>
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
        Pending invitations
      </h2>
      <Card className="border-background/20 bg-background/5 text-background ring-0">
        <CardContent className="p-0">
          {status === "loading" || status === "idle" ? (
            <LoadingState message="Loading pending invitations..." />
          ) : null}
          {status === "error" ? (
            <ErrorState message={error} onRetry={onRetry} retryLabel="Retry invitations" />
          ) : null}
          {status === "success" && invitations.length === 0 ? (
            <p className="p-6 text-sm text-background/75">No pending invitations.</p>
          ) : null}
          {status === "success" && invitations.length > 0 ? (
            <ul className="divide-y divide-background/10" aria-label="Pending invitations">
              {invitations.map((invitation) => (
                <li key={invitation.id} className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InvitationField label="Email" value={invitation.email} />
                  <InvitationField label="Status" value={formatStatus(invitation.status)} />
                  <InvitationField label="Expiration" value={formatDate(invitation.expiresAt)} />
                  <InvitationField label="Invited by" value={displayInviter(invitation)} />
                  <InvitationField label="Role" value={invitation.proposedRole.name ?? invitation.proposedRole.key} />
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
      setFieldError("Enter a valid email address.");
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
      setCopyStatus("Invitation link copied.");
    } catch {
      setCopyStatus("We couldn't copy the link. Select and copy it manually.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button type="button" onClick={() => setOpen(true)}>
        Invite member
      </Button>
      <DialogContent>
        {createInvitation.acceptanceUrl ? (
          <>
            <DialogHeader>
              <DialogTitle>Invitation created.</DialogTitle>
              <DialogDescription>
                Share this secure link with the invited person.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <label className="grid gap-2 text-sm font-medium">
                Invitation link
                <Input readOnly value={createInvitation.acceptanceUrl} />
              </label>
              {copyStatus ? (
                <p className="text-sm text-background/75" role="status" aria-live="polite">
                  {copyStatus}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
              <Button type="button" onClick={() => void copyInvitationLink()}>
                Copy invitation link
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
            <DialogHeader>
              <DialogTitle>Invite member</DialogTitle>
              <DialogDescription>
                Create a one-time invitation link for a new organization member.
              </DialogDescription>
            </DialogHeader>
            <label className="grid gap-2 text-sm font-medium" htmlFor="invite-member-email">
              Email
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={createInvitation.pending}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={createInvitation.pending}>
                {createInvitation.pending ? "Creating invitation..." : "Create invitation"}
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
        {pending ? "Revoking..." : "Revoke"}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the invitation for {invitation.email} unusable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
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
              {pending ? "Revoking..." : "Revoke"}
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
          actionLabel="Suspend"
          confirmLabel="Suspend member"
          description={`${displayMemberName(member)} will lose access until reactivated.`}
          disabled={pending}
          onConfirm={() => mutation.suspend(member.id)}
          pendingLabel="Suspending..."
          title="Suspend member?"
        />
      ) : null}
      {member.status === "SUSPENDED" ? (
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => void mutation.reactivate(member.id)}
        >
          {pending ? "Reactivating..." : "Reactivate"}
        </Button>
      ) : null}
      <ConfirmMemberAction
        actionLabel="Remove"
        confirmLabel="Remove member"
        description="They will lose access to this organization."
        disabled={pending}
        onConfirm={() => mutation.remove(member.id)}
        pendingLabel="Removing..."
        title={`Remove ${displayMemberName(member)} from ${activeOrganizationName ?? "this organization"}?`}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabled}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant={variant}
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
    return <span className="text-background/65">No roles assigned.</span>;
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
      {formatStatus(status)}
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
  return <p className="p-6 text-sm text-background/75">No members are available for this organization.</p>;
}

function OnlyMemberState({ member }: Readonly<{ member: OrganizationMember }>) {
  return (
    <div className="grid gap-4 p-6">
      <MemberIdentity member={member} />
      <div className="grid gap-1 text-sm text-background/75">
        <p>You&apos;re the only member of this organization.</p>
        <p>Invite your team when you&apos;re ready.</p>
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
  return invitation.invitedBy.displayName || invitation.invitedBy.email;
}

function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
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
