import { apiRequest } from "@/lib/api/api-client";

import {
  isOrganizationMembersResponse,
  isOrganizationPermissionsResponse,
  isOrganizationRolesResponse,
  type OrganizationMembersResponse,
  type OrganizationPermissionsResponse,
  type OrganizationRolesResponse,
} from "../types/rbac";

interface CreateOrganizationRoleInput {
  name: string;
  description: string;
  permissionKeys: string[];
}

interface UpdateOrganizationRoleInput {
  name: string;
  description: string;
  permissionKeys: string[];
}

interface ReplaceMembershipRolesInput {
  roleIds: string[];
}

function requireResponse<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  message: string,
): T {
  if (!guard(value)) {
    throw new Error(message);
  }

  return value;
}

export async function getOrganizationRoles(accessToken: string): Promise<OrganizationRolesResponse> {
  const response = await apiRequest<unknown>("/api/organizations/current/roles", {
    method: "GET",
    expectedStatus: 200,
    cache: "no-store",
    accessToken,
  });

  return requireResponse(response, isOrganizationRolesResponse, "El backend devolvió roles inválidos.");
}

export async function getOrganizationPermissions(accessToken: string): Promise<OrganizationPermissionsResponse> {
  const response = await apiRequest<unknown>("/api/organizations/current/permissions", {
    method: "GET",
    expectedStatus: 200,
    cache: "no-store",
    accessToken,
  });

  return requireResponse(response, isOrganizationPermissionsResponse, "El backend devolvió permisos inválidos.");
}

export async function getOrganizationMembers(accessToken: string): Promise<OrganizationMembersResponse> {
  const response = await apiRequest<unknown>("/api/organizations/current/members", {
    method: "GET",
    expectedStatus: 200,
    cache: "no-store",
    accessToken,
  });

  return requireResponse(response, isOrganizationMembersResponse, "El backend devolvió miembros inválidos.");
}

export async function createOrganizationRole(
  accessToken: string,
  input: CreateOrganizationRoleInput,
): Promise<void> {
  await apiRequest<void>("/api/organizations/current/roles", {
    method: "POST",
    expectedStatus: 201,
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateOrganizationRole(
  accessToken: string,
  roleId: string,
  input: UpdateOrganizationRoleInput,
): Promise<void> {
  await apiRequest<void>(`/api/organizations/current/roles/${roleId}`, {
    method: "PATCH",
    expectedStatus: 200,
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteOrganizationRole(accessToken: string, roleId: string): Promise<void> {
  await apiRequest<void>(`/api/organizations/current/roles/${roleId}`, {
    method: "DELETE",
    expectedStatus: 204,
    accessToken,
  });
}

export async function replaceMembershipRoles(
  accessToken: string,
  membershipId: string,
  input: ReplaceMembershipRolesInput,
): Promise<void> {
  await apiRequest<void>(`/api/organizations/current/members/${membershipId}/roles`, {
    method: "PUT",
    expectedStatus: 200,
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
