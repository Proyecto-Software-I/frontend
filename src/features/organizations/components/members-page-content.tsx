"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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
      <PageHeader />
      <MembersSection
        error={state.members.error}
        members={state.visibleMembers}
        onRetry={state.retryMembers}
        status={state.members.status}
      />
      <PendingInvitationsSection
        error={state.invitations.error}
        invitations={state.pendingInvitations}
        onRetry={state.retryInvitations}
        status={state.invitations.status}
      />
    </div>
  );
}

function PageHeader() {
  return (
    <section aria-labelledby="members-title" className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/65">
        Settings
      </p>
      <h1 id="members-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Members
      </h1>
      <p className="text-lg text-background/65">
        Manage the people who have access to this organization.
      </p>
    </section>
  );
}

function MembersSection({
  error,
  members,
  onRetry,
  status,
}: Readonly<{
  error: string | null;
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
          {status === "success" && members.length > 1 ? (
            <MembersList members={members} />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function MembersList({
  members,
}: Readonly<{ members: OrganizationMember[] }>) {
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
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function PendingInvitationsSection({
  error,
  invitations,
  onRetry,
  status,
}: Readonly<{
  error: string | null;
  invitations: OrganizationInvitation[];
  onRetry: () => void;
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
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </section>
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

function getInitials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
