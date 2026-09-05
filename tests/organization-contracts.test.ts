import { describe, expect, it } from "vitest";

import type { AuthUser, Membership, Organization } from "@/features/auth/types/auth";
import {
  isCreateInvitationResult,
  isInvitationPreview,
  isOrganizationInvitation,
  isOrganizationMember,
} from "@/features/organizations/lib/validators";
import type { OrganizationMember } from "@/features/organizations/types/organizations";

const member = {
  id: "membership-1",
  status: "ACTIVE",
  joinedAt: "2026-09-01T10:00:00.000Z",
  jobTitle: null,
  roles: ["OWNER"],
  user: {
    id: "user-1",
    email: "owner@example.com",
    displayName: "Owner User",
    firstName: "Owner",
    lastName: "User",
  },
};

const invitation = {
  id: "invitation-1",
  email: "member@example.com",
  status: "PENDING",
  createdAt: "2026-09-01T10:00:00.000Z",
  expiresAt: "2026-09-08T10:00:00.000Z",
  invitedBy: {
    id: "user-1",
    email: "owner@example.com",
    displayName: "Owner User",
  },
  proposedRole: {
    key: "MEMBER",
    name: "Member",
  },
};

describe("organization runtime contracts", () => {
  it("accepts a valid organization member and reuses AuthUser projection", () => {
    expect(isOrganizationMember(member)).toBe(true);
    const accepted: OrganizationMember = member;
    const authUser: AuthUser = accepted.user;
    expect(authUser.email).toBe("owner@example.com");
  });

  it("rejects malformed organization members", () => {
    expect(isOrganizationMember({ ...member, status: "REMOVED" })).toBe(false);
    expect(isOrganizationMember({ ...member, joinedAt: "not-a-date" })).toBe(false);
    expect(isOrganizationMember({ ...member, roles: ["OWNER", 1] })).toBe(false);
    expect(isOrganizationMember({ ...member, user: { ...member.user, email: null } })).toBe(false);
  });

  it("accepts valid organization invitations and rejects malformed nested objects", () => {
    expect(isOrganizationInvitation(invitation)).toBe(true);
    expect(isOrganizationInvitation({ ...invitation, tokenHash: "secret" })).toBe(false);
    expect(isOrganizationInvitation({ ...invitation, status: "UNKNOWN" })).toBe(false);
    expect(isOrganizationInvitation({ ...invitation, invitedBy: { id: "user-1" } })).toBe(false);
    expect(isOrganizationInvitation({ ...invitation, proposedRole: { id: "role-1" } })).toBe(false);
  });

  it("accepts valid invitation previews and rejects malformed previews", () => {
    expect(isInvitationPreview({
      email: "member@example.com",
      organization: { name: "Organization", slug: "organization" },
      expiresAt: "2026-09-08T10:00:00.000Z",
    })).toBe(true);
    expect(isInvitationPreview({
      email: "member@example.com",
      organization: { id: "org-1", name: "Organization", slug: "organization" },
      expiresAt: "2026-09-08T10:00:00.000Z",
    })).toBe(false);
    expect(isInvitationPreview({
      email: "member@example.com",
      organization: { name: "Organization" },
      expiresAt: "invalid",
    })).toBe(false);
  });

  it("accepts valid creation responses and rejects malformed acceptanceUrl", () => {
    expect(isCreateInvitationResult({
      ...invitation,
      acceptanceUrl: "/invite/token-123",
    })).toBe(true);
    expect(isCreateInvitationResult({
      ...invitation,
      acceptanceUrl: "",
    })).toBe(false);
  });

  it("does not require new canonical Organization or Membership types", () => {
    const organization: Organization = { id: "org-1", name: "Organization", slug: "organization" };
    const membership: Membership = {
      id: "membership-1",
      status: "ACTIVE",
      organization,
      roles: ["OWNER"],
    };
    expect(membership.organization.slug).toBe("organization");
  });
});

export { invitation as validInvitationFixture, member as validMemberFixture };
