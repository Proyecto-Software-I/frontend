import type { FullSession, SessionContext } from "@/features/auth/types/auth";

export function sessionWithMemberships(
  count: number,
  requiresOrganizationSelection = count > 1,
  accessToken = "access-token-1",
  membershipStatus = "ACTIVE",
): FullSession {
  const memberships = Array.from({ length: count }, (_, index) => ({
    id: `membership-${index + 1}`, status: membershipStatus,
    organization: { id: `organization-${index + 1}`, name: `Organization ${index + 1}`, slug: `organization-${index + 1}` },
    roles: ["member"],
  }));
  const selected = memberships[0];
  const hasActiveMembership = membershipStatus === "ACTIVE";

  return {
    user: { id: "user-1", email: "user@example.com", displayName: "Test User", firstName: "Test", lastName: "User" },
    activeOrganization: requiresOrganizationSelection || !hasActiveMembership
      ? null
      : selected?.organization ?? null,
    activeMembership: requiresOrganizationSelection || !hasActiveMembership
      ? null
      : selected
        ? { id: selected.id, status: selected.status, roles: selected.roles }
        : null,
    memberships,
    requiresOrganizationSelection,
    auth: { accessToken, tokenType: "Bearer", expiresIn: 900 },
  };
}

export function sessionWithZeroActiveMemberships(
  accessToken = "access-token-zero-active",
): FullSession {
  return sessionWithMemberships(1, false, accessToken, "INACTIVE");
}

export function contextFromSession(session: FullSession): SessionContext {
  return { user: session.user, activeOrganization: session.activeOrganization, activeMembership: session.activeMembership, memberships: session.memberships, requiresOrganizationSelection: session.requiresOrganizationSelection };
}

export function refreshResponse(accessToken = "refresh-token-1") {
  return {
    auth: { accessToken, tokenType: "Bearer", expiresIn: 900 },
  };
}
