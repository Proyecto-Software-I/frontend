import { apiRequest } from "@/lib/api/api-client";

import {
  isFullSession,
  isRefreshResponse,
  isSessionContext,
  type FullSession,
  type RefreshResponse,
  type SessionContext,
} from "../types/auth";

interface RegisterBaseInput {
  firstName: string;
  lastName: string;
  password: string;
}

export interface NormalRegisterInput extends RegisterBaseInput {
  email: string;
  organizationName: string;
  invitationToken?: never;
}

export interface InvitationRegisterInput extends RegisterBaseInput {
  invitationToken: string;
  email?: never;
  organizationName?: never;
}

export type RegisterInput = NormalRegisterInput | InvitationRegisterInput;

export interface LoginInput {
  email: string;
  password: string;
}

function requireResponse<T>(value: unknown, isValid: (value: unknown) => value is T): T {
  if (!isValid(value)) {
    throw new Error("El backend devolvió una respuesta de autenticación inesperada.");
  }

  return value;
}

export async function register(input: RegisterInput): Promise<FullSession> {
  const body = "invitationToken" in input
    ? {
        firstName: input.firstName,
        lastName: input.lastName,
        password: input.password,
        invitationToken: input.invitationToken,
      }
    : {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: input.password,
        organizationName: input.organizationName,
      };
  const response = await apiRequest<unknown>("/api/auth/register", {
    method: "POST",
    expectedStatus: 201,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return requireResponse(response, isFullSession);
}

export async function login(input: LoginInput): Promise<FullSession> {
  const response = await apiRequest<unknown>("/api/auth/login", {
    method: "POST",
    expectedStatus: 200,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return requireResponse(response, isFullSession);
}

export async function refresh(): Promise<RefreshResponse> {
  const response = await apiRequest<unknown>("/api/auth/refresh", {
    method: "POST",
    expectedStatus: 200,
    credentials: "include",
  });

  return requireResponse(response, isRefreshResponse);
}

export async function getMe(accessToken: string): Promise<SessionContext> {
  const response = await apiRequest<unknown>("/api/auth/me", {
    method: "GET",
    expectedStatus: 200,
    accessToken,
    cache: "no-store",
  });

  return requireResponse(response, isSessionContext);
}

export async function selectOrganization(
  accessToken: string,
  organizationId: string,
): Promise<FullSession> {
  const response = await apiRequest<unknown>("/api/auth/select-organization", {
    method: "POST",
    expectedStatus: 200,
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId }),
  });

  return requireResponse(response, isFullSession);
}

export async function logout(accessToken: string): Promise<void> {
  await apiRequest<void>("/api/auth/logout", {
    method: "POST",
    expectedStatus: 204,
    accessToken,
    credentials: "include",
  });
}
