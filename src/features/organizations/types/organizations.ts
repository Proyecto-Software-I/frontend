import type { AuthUser, Organization } from "@/features/auth/types/auth";

export type OrganizationMemberStatus = "ACTIVE" | "SUSPENDED" | "REMOVED";

export type OrganizationInvitationStatus =
  | "PENDING"
  | "EXPIRED"
  | "REVOKED"
  | "ACCEPTED";

export interface OrganizationRoleSummary {
  key: string;
  name?: string;
}

export type OrganizationMemberUser = AuthUser & {
  avatarUrl: string | null;
};

export interface OrganizationMember {
  id: string;
  status: OrganizationMemberStatus;
  joinedAt: string;
  jobTitle: string | null;
  roles: string[];
  user: OrganizationMemberUser;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  status: OrganizationInvitationStatus;
  createdAt: string;
  expiresAt: string;
  invitedBy: Pick<AuthUser, "id" | "displayName">;
  proposedRole: OrganizationRoleSummary;
}

export interface OrganizationMembersResponse {
  members: OrganizationMember[];
}

export interface OrganizationInvitationsResponse {
  invitations: OrganizationInvitation[];
}

export interface InvitationPreview {
  email: string;
  organization: Pick<Organization, "name" | "slug">;
  expiresAt: string;
}

export interface CreateInvitationResult {
  invitation: OrganizationInvitation;
  acceptanceUrl: string;
}

export interface CreateInvitationInput {
  email: string;
}
