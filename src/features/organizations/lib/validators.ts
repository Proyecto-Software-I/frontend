import type { AuthUser } from "@/features/auth/types/auth";

import type {
  CreateInvitationResult,
  InvitationPreview,
  OrganizationInvitation,
  OrganizationInvitationStatus,
  OrganizationMember,
  OrganizationMemberStatus,
  OrganizationMemberUser,
  OrganizationRoleSummary,
} from "../types/organizations";

const memberStatuses = new Set<OrganizationMemberStatus>([
  "ACTIVE",
  "SUSPENDED",
  "REMOVED",
]);
const invitationStatuses = new Set<OrganizationInvitationStatus>([
  "PENDING",
  "EXPIRED",
  "REVOKED",
  "ACCEPTED",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isValidDateString(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isAuthUserProjection(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.email) &&
    isNullableString(value.displayName) &&
    isNullableString(value.firstName) &&
    isNullableString(value.lastName)
  );
}

function isOrganizationMemberUser(value: unknown): value is OrganizationMemberUser {
  return isAuthUserProjection(value);
}

function isInvitedBy(value: unknown): value is Pick<AuthUser, "id" | "email" | "displayName"> {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.email) &&
    isNullableString(value.displayName)
  );
}

function isRoleSummary(value: unknown): value is OrganizationRoleSummary {
  return (
    isRecord(value) &&
    isNonEmptyString(value.key) &&
    (!("name" in value) || isNonEmptyString(value.name))
  );
}

export function isOrganizationMember(value: unknown): value is OrganizationMember {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    memberStatuses.has(value.status as OrganizationMemberStatus) &&
    isValidDateString(value.joinedAt) &&
    isNullableString(value.jobTitle) &&
    isStringArray(value.roles) &&
    isOrganizationMemberUser(value.user)
  );
}

export function isOrganizationMemberList(value: unknown): value is OrganizationMember[] {
  return Array.isArray(value) && value.every(isOrganizationMember);
}

export function isOrganizationInvitation(value: unknown): value is OrganizationInvitation {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.email) &&
    invitationStatuses.has(value.status as OrganizationInvitationStatus) &&
    isValidDateString(value.createdAt) &&
    isValidDateString(value.expiresAt) &&
    isInvitedBy(value.invitedBy) &&
    isRoleSummary(value.proposedRole) &&
    !("acceptanceUrl" in value) &&
    !("tokenHash" in value)
  );
}

export function isOrganizationInvitationList(value: unknown): value is OrganizationInvitation[] {
  return Array.isArray(value) && value.every(isOrganizationInvitation);
}

export function isInvitationPreview(value: unknown): value is InvitationPreview {
  return (
    isRecord(value) &&
    isNonEmptyString(value.email) &&
    isRecord(value.organization) &&
    isNonEmptyString(value.organization.name) &&
    isNonEmptyString(value.organization.slug) &&
    !("id" in value.organization) &&
    isValidDateString(value.expiresAt)
  );
}

export function isCreateInvitationResult(value: unknown): value is CreateInvitationResult {
  return (
    isRecord(value) &&
    isOrganizationInvitation(withoutAcceptanceUrl(value)) &&
    isNonEmptyString(value.acceptanceUrl)
  );
}

function withoutAcceptanceUrl(value: Record<string, unknown>): Record<string, unknown> {
  const invitation = { ...value };
  delete invitation.acceptanceUrl;
  return invitation;
}
