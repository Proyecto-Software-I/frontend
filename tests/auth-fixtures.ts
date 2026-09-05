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
    permissions: ["organization.read"],
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
        ? {
            id: selected.id,
            status: selected.status,
            roles: selected.roles,
            permissions: selected.permissions,
          }
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

export function selectedSessionWithMultipleMemberships(
  accessToken = "selected-access-token",
): FullSession {
  const session = sessionWithMemberships(2, false, accessToken);
  session.memberships = [
    {
      id: "membership123",
      status: "ACTIVE",
      organization: { id: "org123", name: "Organization 123", slug: "organization-123" },
      roles: ["OWNER"],
      permissions: ["members.read", "members.manage"],
    },
    {
      id: "membership321",
      status: "ACTIVE",
      organization: { id: "org321", name: "Organization 321", slug: "organization-321" },
      roles: [],
      permissions: ["members.read", "members.manage"],
    },
  ];
  session.activeOrganization = session.memberships[1].organization;
  session.activeMembership = {
    id: session.memberships[1].id,
    status: session.memberships[1].status,
    roles: session.memberships[1].roles,
    permissions: session.memberships[1].permissions,
  };
  return session;
}

export function preSelectionSessionWithMultipleMemberships(
  accessToken = "pending-token",
): FullSession {
  const session = selectedSessionWithMultipleMemberships(accessToken);
  session.activeOrganization = null;
  session.activeMembership = null;
  session.requiresOrganizationSelection = true;
  return session;
}

export function contextFromSession(session: FullSession): SessionContext {
  return { user: session.user, activeOrganization: session.activeOrganization, activeMembership: session.activeMembership, memberships: session.memberships, requiresOrganizationSelection: session.requiresOrganizationSelection };
}

export function refreshResponse(accessToken = "refresh-token-1") {
  return {
    auth: { accessToken, tokenType: "Bearer", expiresIn: 900 },
  };
}
