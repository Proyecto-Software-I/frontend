import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  acceptInvitation,
  createOrganizationInvitation,
  getInvitationPreview,
  listOrganizationInvitations,
  listOrganizationMembers,
  reactivateOrganizationMember,
  removeOrganizationMember,
  revokeOrganizationInvitation,
  suspendOrganizationMember,
} from "@/features/organizations/api/organization-members-api";
import { validInvitationFixture, validMemberFixture } from "./organization-contracts.test";

function response(status: number, body?: unknown, headers?: HeadersInit) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: body === undefined ? headers : { "content-type": "application/json", ...headers },
  });
}

describe("organization API contract", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("lists members with GET, exact path, Bearer, no organizationId, and validates responses", async () => {
    fetchMock.mockResolvedValue(response(200, [validMemberFixture]));

    await expect(listOrganizationMembers("access-token")).resolves.toEqual([validMemberFixture]);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/organizations/current/members",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
    const request = fetchMock.mock.calls[0]?.[1];
    expect(JSON.stringify(request)).not.toContain("organizationId");

    fetchMock.mockResolvedValueOnce(response(200, [{ ...validMemberFixture, user: null }]));
    await expect(listOrganizationMembers("access-token")).rejects.toThrow(
      "respuesta de organizaciones inesperada",
    );
  });

  it("lists invitations with GET, exact path, Bearer, no organizationId, and validates responses", async () => {
    fetchMock.mockResolvedValue(response(200, [validInvitationFixture]));

    await expect(listOrganizationInvitations("access-token")).resolves.toEqual([validInvitationFixture]);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/organizations/current/invitations",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls[0]?.[1])).not.toContain("organizationId");

    fetchMock.mockResolvedValueOnce(response(200, [{ ...validInvitationFixture, tokenHash: "secret" }]));
    await expect(listOrganizationInvitations("access-token")).rejects.toThrow(
      "respuesta de organizaciones inesperada",
    );
  });

  it("creates invitations with the published method, path, body and response contract", async () => {
    const created = {
      ...validInvitationFixture,
      acceptanceUrl: "/invite/token-123",
    };
    fetchMock.mockResolvedValue(response(201, created));

    await expect(createOrganizationInvitation("access-token", { email: "member@example.com" })).resolves.toEqual(created);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/organizations/current/invitations",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "member@example.com" }),
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(JSON.stringify(fetchMock.mock.calls[0]?.[1])).not.toContain("organizationId");

    fetchMock.mockResolvedValueOnce(response(201, { ...created, acceptanceUrl: "" }));
    await expect(createOrganizationInvitation("access-token", { email: "member@example.com" })).rejects.toThrow(
      "respuesta de organizaciones inesperada",
    );
  });

  it("uses encoded IDs for tenant-scoped invitation and member mutations and accepts 2xx without body", async () => {
    fetchMock
      .mockResolvedValueOnce(response(204))
      .mockResolvedValueOnce(response(200))
      .mockResolvedValueOnce(response(204))
      .mockResolvedValueOnce(response(200));

    await expect(revokeOrganizationInvitation("access-token", "invitation/id 1")).resolves.toBeUndefined();
    await expect(suspendOrganizationMember("access-token", "membership/id 1")).resolves.toBeUndefined();
    await expect(reactivateOrganizationMember("access-token", "membership/id 2")).resolves.toBeUndefined();
    await expect(removeOrganizationMember("access-token", "membership/id 3")).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenNthCalledWith(1,
      "http://localhost:3000/api/organizations/current/invitations/invitation%2Fid%201",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2,
      "http://localhost:3000/api/organizations/current/members/membership%2Fid%201",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "SUSPENDED" }),
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3,
      "http://localhost:3000/api/organizations/current/members/membership%2Fid%202",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" }),
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(4,
      "http://localhost:3000/api/organizations/current/members/membership%2Fid%203",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
  });

  it("previews public invitations without Bearer and validates the response", async () => {
    const preview = {
      email: "member@example.com",
      organization: { name: "Organization", slug: "organization" },
      expiresAt: "2026-09-08T10:00:00.000Z",
    };
    fetchMock.mockResolvedValue(response(200, preview));

    await expect(getInvitationPreview("token/with space")).resolves.toEqual(preview);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/invitations/token%2Fwith%20space",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toEqual(
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.any(String) }) }),
    );

    fetchMock.mockResolvedValueOnce(response(200, { ...preview, organization: { id: "org-1" } }));
    await expect(getInvitationPreview("token")).rejects.toThrow(
      "respuesta de organizaciones inesperada",
    );
  });

  it("accepts invitations with POST and Bearer without inventing a response contract", async () => {
    fetchMock.mockResolvedValue(response(200));

    await expect(acceptInvitation("access-token", "token/with space")).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/invitations/token%2Fwith%20space/accept",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer access-token" }),
      }),
    );
  });
});
