import { apiRequest } from "@/lib/api/api-client";

import {
  isCreateInvitationResult,
  isInvitationPreview,
  isOrganizationInvitationsResponse,
  isOrganizationMembersResponse,
} from "../lib/validators";
import type {
  CreateInvitationInput,
  CreateInvitationResult,
  InvitationPreview,
  OrganizationInvitation,
  OrganizationMember,
} from "../types/organizations";

function requireResponse<T>(value: unknown, isValid: (value: unknown) => value is T): T {
  if (!isValid(value)) {
    throw new Error("El backend devolvió una respuesta de organizaciones inesperada.");
  }

  return value;
}

function segment(value: string): string {
  return encodeURIComponent(value);
}

export async function listOrganizationMembers(
  accessToken: string,
): Promise<OrganizationMember[]> {
  const response = await apiRequest<unknown>("/api/organizations/current/members", {
    method: "GET",
    expectedStatus: 200,
    accessToken,
    cache: "no-store",
  });

  return requireResponse(response, isOrganizationMembersResponse).members;
}

export async function listOrganizationInvitations(
  accessToken: string,
): Promise<OrganizationInvitation[]> {
  const response = await apiRequest<unknown>("/api/organizations/current/invitations", {
    method: "GET",
    expectedStatus: 200,
    accessToken,
    cache: "no-store",
  });

  return requireResponse(response, isOrganizationInvitationsResponse).invitations;
}

export async function createOrganizationInvitation(
  accessToken: string,
  input: CreateInvitationInput,
): Promise<CreateInvitationResult> {
  const response = await apiRequest<unknown>("/api/organizations/current/invitations", {
    method: "POST",
    expectedStatus: 201,
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: input.email }),
  });

  return requireResponse(response, isCreateInvitationResult);
}

export async function revokeOrganizationInvitation(
  accessToken: string,
  invitationId: string,
): Promise<void> {
  await apiRequest<unknown>(
    `/api/organizations/current/invitations/${segment(invitationId)}`,
    { method: "DELETE", accessToken },
  );
}

export async function suspendOrganizationMember(
  accessToken: string,
  membershipId: string,
): Promise<void> {
  await updateOrganizationMemberStatus(accessToken, membershipId, "SUSPENDED");
}

export async function reactivateOrganizationMember(
  accessToken: string,
  membershipId: string,
): Promise<void> {
  await updateOrganizationMemberStatus(accessToken, membershipId, "ACTIVE");
}

export async function removeOrganizationMember(
  accessToken: string,
  membershipId: string,
): Promise<void> {
  await apiRequest<unknown>(
    `/api/organizations/current/members/${segment(membershipId)}`,
    { method: "DELETE", accessToken },
  );
}

export async function getInvitationPreview(token: string): Promise<InvitationPreview> {
  const response = await apiRequest<unknown>(`/api/invitations/${segment(token)}`, {
    method: "GET",
    expectedStatus: 200,
    cache: "no-store",
  });

  return requireResponse(response, isInvitationPreview);
}

export async function acceptInvitation(
  accessToken: string,
  token: string,
): Promise<void> {
  await apiRequest<unknown>(`/api/invitations/${segment(token)}/accept`, {
    method: "POST",
    accessToken,
  });
}

async function updateOrganizationMemberStatus(
  accessToken: string,
  membershipId: string,
  status: "ACTIVE" | "SUSPENDED",
): Promise<void> {
  await apiRequest<unknown>(`/api/organizations/current/members/${segment(membershipId)}`, {
    method: "PATCH",
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
