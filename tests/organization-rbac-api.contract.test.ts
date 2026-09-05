import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createOrganizationRole,
  deleteOrganizationRole,
  getOrganizationMembers,
  getOrganizationPermissions,
  getOrganizationRoles,
  replaceMembershipRoles,
  updateOrganizationRole,
} from "@/features/organizations/api/organization-rbac-api";

function response(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("organization RBAC API contract", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("uses exact read endpoints for roles, permissions and members", async () => {
    fetchMock
      .mockResolvedValueOnce(response(200, {
        roles: [
          {
            id: "role-1",
            key: "OWNER",
            name: "Owner",
            description: null,
            scope: "ORGANIZATION",
            isSystem: true,
            permissions: ["members.read"],
          },
        ],
      }))
      .mockResolvedValueOnce(response(200, {
        permissions: [{ key: "members.read", description: "Read members" }],
      }))
      .mockResolvedValueOnce(response(200, {
        members: [
          {
            id: "membership-1",
            status: "ACTIVE",
            user: {
              id: "user-1",
              email: "member@example.com",
              displayName: "Member",
              firstName: "Member",
              lastName: "One",
            },
            roles: ["OWNER"],
          },
        ],
      }));

    await expect(getOrganizationRoles("token")).resolves.toMatchObject({ roles: expect.any(Array) });
    await expect(getOrganizationPermissions("token")).resolves.toMatchObject({ permissions: expect.any(Array) });
    await expect(getOrganizationMembers("token")).resolves.toMatchObject({ members: expect.any(Array) });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://localhost:3000/api/organizations/current/roles");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("http://localhost:3000/api/organizations/current/permissions");
    expect(fetchMock.mock.calls[2]?.[0]).toBe("http://localhost:3000/api/organizations/current/members");
  });

  it("sends write operations using backend contract shapes", async () => {
    fetchMock
      .mockResolvedValueOnce(response(201, {}))
      .mockResolvedValueOnce(response(200, {}))
      .mockResolvedValueOnce(response(204, undefined))
      .mockResolvedValueOnce(response(200, {}));

    await createOrganizationRole("token", {
      name: "Security reviewer",
      description: "Reviews audit and analysis",
      permissionKeys: ["analysis.read", "reports.read"],
    });
    await updateOrganizationRole("token", "role-2", {
      name: "Security reviewer",
      description: "Reviews audit and analysis",
      permissionKeys: ["analysis.read"],
    });
    await deleteOrganizationRole("token", "role-2");
    await replaceMembershipRoles("token", "membership-2", { roleIds: ["role-2"] });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://localhost:3000/api/organizations/current/roles");
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        name: "Security reviewer",
        description: "Reviews audit and analysis",
        permissionKeys: ["analysis.read", "reports.read"],
      }),
    }));

    expect(fetchMock.mock.calls[1]?.[0]).toBe("http://localhost:3000/api/organizations/current/roles/role-2");
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(expect.objectContaining({ method: "PATCH" }));

    expect(fetchMock.mock.calls[2]?.[0]).toBe("http://localhost:3000/api/organizations/current/roles/role-2");
    expect(fetchMock.mock.calls[2]?.[1]).toEqual(expect.objectContaining({ method: "DELETE" }));

    expect(fetchMock.mock.calls[3]?.[0]).toBe("http://localhost:3000/api/organizations/current/members/membership-2/roles");
    expect(fetchMock.mock.calls[3]?.[1]).toEqual(expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ roleIds: ["role-2"] }),
    }));
  });
});
