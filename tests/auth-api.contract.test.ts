import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getMe,
  login,
  logout,
  refresh,
  register,
  selectOrganization,
  type RegisterInput,
} from "@/features/auth/api/auth-api";
import { isSessionContext } from "@/features/auth/types/auth";
import {
  selectedSessionWithMultipleMemberships,
  sessionWithMemberships,
  sessionWithZeroActiveMemberships,
} from "./auth-fixtures";

function response(status: number, body?: unknown, headers?: HeadersInit) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("authentication API contract", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sends registration to the exact endpoint, status, and Set-Cookie boundary", async () => {
    const session = sessionWithMemberships(1);
    const registerResponse = response(201, session, {
      "set-cookie": "legacylift_refresh=opaque; Path=/api/auth; HttpOnly; SameSite=Lax",
    });
    fetchMock.mockResolvedValue(registerResponse);

    await expect(
      register({
        email: "user@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        organizationName: "Organization 1",
      }),
    ).resolves.toEqual(session);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as Record<string, unknown>;
    expect(body).toEqual({
      firstName: "Test",
      lastName: "User",
      email: "user@example.com",
      password: "password",
      organizationName: "Organization 1",
    });
    expect(body).not.toHaveProperty("invitationToken");
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.headers.get("set-cookie")).toBe(
      "legacylift_refresh=opaque; Path=/api/auth; HttpOnly; SameSite=Lax",
    );
  });

  it("sends login to the exact endpoint, status, and Set-Cookie boundary", async () => {
    const session = sessionWithMemberships(1);
    const loginResponse = response(200, session, {
      "set-cookie": "legacylift_refresh=opaque; Path=/api/auth; HttpOnly; SameSite=Lax",
    });
    fetchMock.mockResolvedValue(loginResponse);

    await expect(login({ email: "user@example.com", password: "password" })).resolves.toEqual(session);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/login",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers.get("set-cookie")).toBe(
      "legacylift_refresh=opaque; Path=/api/auth; HttpOnly; SameSite=Lax",
    );
  });

  it("uses cookie-only refresh and accepts auth metadata without refresh JSON", async () => {
    const body = { auth: { accessToken: "token", tokenType: "Bearer", expiresIn: 900 } };
    const refreshResponse = response(200, body, {
      "set-cookie": "legacylift_refresh=rotated; Path=/api/auth; HttpOnly; SameSite=Lax",
    });
    fetchMock.mockResolvedValue(refreshResponse);

    await expect(refresh()).resolves.toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/refresh",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toEqual(
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.any(String) }) }),
    );
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.headers.get("set-cookie")).toBe(
      "legacylift_refresh=rotated; Path=/api/auth; HttpOnly; SameSite=Lax",
    );
  });

  it("uses Bearer auth for me and selection, including the selected organization body", async () => {
    const context = sessionWithMemberships(1);
    const selected = selectedSessionWithMultipleMemberships();
    const meResponse = response(200, { ...context, auth: undefined });
    const selectOrganizationResponse = response(200, selected);
    fetchMock
      .mockResolvedValueOnce(meResponse)
      .mockResolvedValueOnce(selectOrganizationResponse);

    await expect(getMe("me-token")).resolves.toMatchObject({ user: context.user });
    await expect(selectOrganization("me-token", "org321")).resolves.toEqual(selected);
    expect(meResponse.status).toBe(200);
    expect(selectOrganizationResponse.status).toBe(200);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/me",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: expect.objectContaining({ Authorization: "Bearer me-token" }),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/select-organization",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ organizationId: "org321" }),
        headers: expect.objectContaining({ Authorization: "Bearer me-token" }),
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: "GET", cache: "no-store", headers: expect.objectContaining({ Authorization: "Bearer me-token" }) }),
    );
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ organizationId: "org321" }),
        headers: expect.objectContaining({ Authorization: "Bearer me-token" }),
      }),
    );
    expect(selected.memberships).toHaveLength(2);
    expect(selected.activeOrganization?.id).toBe("org321");
    expect(selected.activeMembership?.roles).toEqual([]);
    expect(selected.activeMembership?.permissions).toEqual([
      "organization.read",
      "members.read",
      "members.manage",
    ]);
  });

  it("sends invitation registration to the same endpoint without email or organization name", async () => {
    const session = sessionWithMemberships(1);
    fetchMock.mockResolvedValue(response(201, session));
    const input: RegisterInput = {
      firstName: "Invited",
      lastName: "User",
      password: "password",
      invitationToken: "invite-token-123",
    };

    await expect(register(input)).resolves.toEqual(session);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      firstName: "Invited",
      lastName: "User",
      password: "password",
      invitationToken: "invite-token-123",
    });
  });

  it("keeps the canonical register adapter from sending mixed invitation fields", async () => {
    const session = sessionWithMemberships(1);
    fetchMock.mockResolvedValue(response(201, session));
    const bypassedTypeSystem = {
      firstName: "Invited",
      lastName: "User",
      email: "ignored@example.com",
      password: "password",
      organizationName: "Ignored Org",
      invitationToken: "invite-token-123",
    } as RegisterInput;

    await register(bypassedTypeSystem);

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      firstName: "Invited",
      lastName: "User",
      password: "password",
      invitationToken: "invite-token-123",
    });
  });

  it("validates active membership permissions from the Auth contract", () => {
    const validSession = sessionWithMemberships(1, false, "token", "ACTIVE", []);
    expect(isSessionContext({ ...validSession, auth: undefined })).toBe(true);

    const malformedPermissions = sessionWithMemberships(1);
    malformedPermissions.activeMembership = {
      id: "membership-1",
      status: "ACTIVE",
      roles: [],
      permissions: ["members.read", 1] as unknown as string[],
    };
    expect(isSessionContext({ ...malformedPermissions, auth: undefined })).toBe(false);

    const missingPermissions = sessionWithMemberships(1);
    missingPermissions.activeMembership = {
      id: "membership-1",
      status: "ACTIVE",
      roles: [],
    } as unknown as typeof missingPermissions.activeMembership;
    expect(isSessionContext({ ...missingPermissions, auth: undefined })).toBe(false);
  });

  it("treats logout 204 as success with Bearer and credentials", async () => {
    const logoutResponse = response(204, undefined, {
      "set-cookie": "legacylift_refresh=; Max-Age=0; Path=/api/auth",
    });
    fetchMock.mockResolvedValue(logoutResponse);

    await expect(logout("logout-token")).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({ Authorization: "Bearer logout-token" }),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/logout",
      expect.anything(),
    );
    expect(logoutResponse.status).toBe(204);
    expect(logoutResponse.headers.get("set-cookie")).toBe(
      "legacylift_refresh=; Max-Age=0; Path=/api/auth",
    );
  });

  it("rejects a valid-shaped context with zero ACTIVE memberships", async () => {
    const inactiveSession = sessionWithZeroActiveMemberships();
    fetchMock.mockResolvedValue(response(200, { ...inactiveSession, auth: undefined }));

    await expect(getMe("me-token")).rejects.toThrow(
      "respuesta de autenticación inesperada",
    );
  });
});
