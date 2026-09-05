import type { AuthUser, Organization } from "@/features/auth/types/auth";

export type OrganizationMemberStatus = "ACTIVE" | "SUSPENDED";

export type OrganizationInvitationStatus =
  | "PENDING"
  | "EXPIRED"
  | "REVOKED"
  | "ACCEPTED";

export interface OrganizationRoleSummary {
  key: string;
  name?: string;
}

export type OrganizationMemberUser = AuthUser;

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
  invitedBy: Pick<AuthUser, "id" | "email" | "displayName">;
  proposedRole: OrganizationRoleSummary;
}

export interface InvitationPreview {
  email: string;
  organization: Pick<Organization, "name" | "slug">;
  expiresAt: string;
}

export interface CreateInvitationResult extends OrganizationInvitation {
  acceptanceUrl: string;
}

export interface CreateInvitationInput {
  email: string;
}
