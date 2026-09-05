import type { AuthUser } from "@/features/auth/types/auth";

export interface OrganizationRole {
  id: string;
  key: string;
  name: string;
  description: string | null;
  scope: "ORGANIZATION";
  isSystem: boolean;
  permissions: string[];
}

export interface OrganizationPermission {
  key: string;
  description: string | null;
}

export interface OrganizationMember {
  id: string;
  status: string;
  user: Pick<AuthUser, "id" | "email" | "displayName" | "firstName" | "lastName">;
  roles: string[];
}

export interface OrganizationRolesResponse {
  roles: OrganizationRole[];
}

export interface OrganizationPermissionsResponse {
  permissions: OrganizationPermission[];
}

export interface OrganizationMembersResponse {
  members: OrganizationMember[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isOrganizationRole(value: unknown): value is OrganizationRole {
  return (
    isRecord(value)
    && isString(value.id)
    && isString(value.key)
    && isString(value.name)
    && isNullableString(value.description)
    && value.scope === "ORGANIZATION"
    && typeof value.isSystem === "boolean"
    && isStringList(value.permissions)
  );
}

function isOrganizationPermission(value: unknown): value is OrganizationPermission {
  return (
    isRecord(value)
    && isString(value.key)
    && isNullableString(value.description)
  );
}

function isOrganizationMember(value: unknown): value is OrganizationMember {
  return (
    isRecord(value)
    && isString(value.id)
    && isString(value.status)
    && isRecord(value.user)
    && isString(value.user.id)
    && isString(value.user.email)
    && isNullableString(value.user.displayName)
    && isNullableString(value.user.firstName)
    && isNullableString(value.user.lastName)
    && isStringList(value.roles)
  );
}

export function isOrganizationRolesResponse(value: unknown): value is OrganizationRolesResponse {
  return (
    isRecord(value)
    && Array.isArray(value.roles)
    && value.roles.every(isOrganizationRole)
  );
}

export function isOrganizationPermissionsResponse(value: unknown): value is OrganizationPermissionsResponse {
  return (
    isRecord(value)
    && Array.isArray(value.permissions)
    && value.permissions.every(isOrganizationPermission)
  );
}

export function isOrganizationMembersResponse(value: unknown): value is OrganizationMembersResponse {
  return (
    isRecord(value)
    && Array.isArray(value.members)
    && value.members.every(isOrganizationMember)
  );
}
