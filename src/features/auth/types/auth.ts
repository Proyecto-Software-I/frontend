import type { ApiErrorBody } from "@/lib/api/api-error";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Membership {
  id: string;
  status: string;
  organization: Organization;
  roles: string[];
}

export interface ActiveMembership {
  id: string;
  status: string;
  roles: string[];
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface SessionContext {
  user: AuthUser;
  activeOrganization: Organization | null;
  activeMembership: ActiveMembership | null;
  memberships: Membership[];
  requiresOrganizationSelection: boolean;
}

export interface FullSession extends SessionContext {
  auth: AuthTokens;
}

export interface RefreshResponse {
  auth: AuthTokens;
}

export type AuthErrorBody = ApiErrorBody;

export type AuthStatus =
  | "bootstrapping"
  | "anonymous"
  | "error"
  | "authenticated"
  | "selection-required";

export const ACTIVE_MEMBERSHIP_STATUS = "ACTIVE";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isOrganization(value: unknown): value is Organization {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.slug)
  );
}

export function isMembership(value: unknown): value is Membership {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.status) &&
    isOrganization(value.organization) &&
    Array.isArray(value.roles) &&
    value.roles.every((role) => typeof role === "string")
  );
}

function isUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.email) &&
    (typeof value.displayName === "string" || value.displayName === null) &&
    (typeof value.firstName === "string" || value.firstName === null) &&
    (typeof value.lastName === "string" || value.lastName === null)
  );
}

function isActiveMembership(value: unknown): value is ActiveMembership {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.status) &&
    Array.isArray(value.roles) &&
    value.roles.every((role) => typeof role === "string") &&
    Array.isArray(value.permissions) &&
    value.permissions.every((permission) => typeof permission === "string") &&
    !("organization" in value)
  );
}

function sameStringArray(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function hasUniqueMembershipIdentifiers(memberships: Membership[]): boolean {
  const membershipIds = new Set(memberships.map((membership) => membership.id));
  const organizationIds = new Set(
    memberships.map((membership) => membership.organization.id),
  );

  return (
    membershipIds.size === memberships.length &&
    organizationIds.size === memberships.length
  );
}

function isCoherentSessionContext(
  value: Record<string, unknown>,
  memberships: Membership[],
): boolean {
  const requiresSelection = value.requiresOrganizationSelection === true;
  const activeOrganization = value.activeOrganization;
  const activeMembership = value.activeMembership;
  const activeMemberships = memberships.filter(
    (membership) => membership.status === ACTIVE_MEMBERSHIP_STATUS,
  );

  if (!hasUniqueMembershipIdentifiers(memberships)) {
    return false;
  }

  if (requiresSelection) {
    return (
      activeMemberships.length > 1 &&
      activeOrganization === null &&
      activeMembership === null
    );
  }

  if (
    !isOrganization(activeOrganization) ||
    !isActiveMembership(activeMembership)
  ) {
    return false;
  }

  const matchingMembership = memberships.find(
    (membership) =>
      membership.status === ACTIVE_MEMBERSHIP_STATUS &&
      membership.id === activeMembership.id,
  );

  return (
    matchingMembership !== undefined &&
    matchingMembership.organization.id === activeOrganization.id &&
    matchingMembership.organization.name === activeOrganization.name &&
    matchingMembership.organization.slug === activeOrganization.slug &&
    activeMembership.status === ACTIVE_MEMBERSHIP_STATUS &&
    sameStringArray(matchingMembership.roles, activeMembership.roles)
  );
}

export function isAuthTokens(value: unknown): value is AuthTokens {
  return (
    isRecord(value) &&
    isNonEmptyString(value.accessToken) &&
    value.tokenType === "Bearer" &&
    typeof value.expiresIn === "number" &&
    Number.isFinite(value.expiresIn) &&
    value.expiresIn > 0
  );
}

export function isSessionContext(value: unknown): value is SessionContext {
  if (
    !isRecord(value) ||
    !isUser(value.user) ||
    !Array.isArray(value.memberships) ||
    !value.memberships.every(isMembership) ||
    typeof value.requiresOrganizationSelection !== "boolean"
  ) {
    return false;
  }

  return isCoherentSessionContext(value, value.memberships);
}

export function isFullSession(value: unknown): value is FullSession {
  if (!isRecord(value) || !isSessionContext(value)) {
    return false;
  }

  const record: Record<string, unknown> = value;
  return isAuthTokens(record.auth);
}

export function isRefreshResponse(value: unknown): value is RefreshResponse {
  return (
    isRecord(value) &&
    isAuthTokens(value.auth)
    && !("refreshToken" in value)
  );
}
