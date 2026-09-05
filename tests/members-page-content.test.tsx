import { act, useEffect, useReducer } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import type { SessionContext } from "@/features/auth/types/auth";
import type {
  OrganizationInvitation,
  OrganizationMember,
} from "@/features/organizations/types/organizations";

import { contextFromSession, sessionWithMemberships } from "./auth-fixtures";

const mocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(() => "access-token"),
  listOrganizationInvitations: vi.fn(),
  listOrganizationMembers: vi.fn(),
  publishSession: null as ((session: SessionContext) => void) | null,
  session: null as SessionContext | null,
}));

vi.mock("@/features/auth/hooks/auth-provider", () => ({
  useAuth: () => ({
    getAccessToken: mocks.getAccessToken,
    hasPermission: (permission: string) =>
      mocks.session?.activeMembership?.permissions.includes(permission) ?? false,
    session: mocks.session,
  }),
}));

vi.mock("@/features/organizations/api/organization-members-api", () => ({
  listOrganizationInvitations: mocks.listOrganizationInvitations,
  listOrganizationMembers: mocks.listOrganizationMembers,
}));

import { MembersPageContent } from "@/features/organizations/components/members-page-content";

const mountedRoots: Root[] = [];

describe("MembersPageContent", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.getAccessToken.mockReset();
    mocks.getAccessToken.mockReturnValue("access-token");
    mocks.listOrganizationInvitations.mockReset();
    mocks.listOrganizationMembers.mockReset();
    mocks.publishSession = null;
    mocks.session = sessionContext(["organization.read", "members.read"]);
  });

  afterEach(async () => {
    await cleanupMountedRoots();
    document.body.innerHTML = "";
  });

  it("loads and renders members and invitations without administrative controls", async () => {
    mocks.session = sessionContext(["organization.read", "members.read"]);
    const membersFlight = deferred<OrganizationMember[]>();
    const invitationsFlight = deferred<OrganizationInvitation[]>();
    mocks.listOrganizationMembers.mockReturnValueOnce(membersFlight.promise);
    mocks.listOrganizationInvitations.mockReturnValueOnce(invitationsFlight.promise);

    await renderPage();
    expect(document.body.textContent).toContain("Loading members...");
    await act(async () => {
      membersFlight.resolve([member("member-1"), member("member-2", "SUSPENDED")]);
      invitationsFlight.resolve([invitation("invite-1")]);
      await Promise.resolve();
    });
    await flushPromises();

    expect(mocks.listOrganizationMembers).toHaveBeenCalledWith("access-token");
    expect(mocks.listOrganizationInvitations).toHaveBeenCalledWith("access-token");
    expect(document.body.textContent).toContain("Members");
    expect(document.body.textContent).toContain("Manage the people who have access to this organization.");
    expect(document.body.textContent).toContain("Jane Doe");
    expect(document.body.textContent).toContain("jane@example.com");
    expect(document.body.textContent).toContain("OWNER");
    expect(document.body.textContent).toContain("Active");
    expect(document.body.textContent).toContain("Suspended");
    expect(document.body.textContent).toContain("Pending invitations");
    expect(document.body.textContent).toContain("pending@example.com");
    expect(document.body.textContent).toContain("Pending");
    expect(document.body.textContent).toContain("Jan 10, 2026");
    expect(document.body.textContent).toContain("Admin User");
    expect(document.body.textContent).toContain("Member");
    expect(buttonNamed("Invite member")).toBeNull();
    expect(buttonNamed("Revoke")).toBeNull();
    expect(buttonNamed("Suspend")).toBeNull();
    expect(buttonNamed("Reactivate")).toBeNull();
    expect(buttonNamed("Remove")).toBeNull();
  });

  it("allows members.read without members.manage to view the page", async () => {
    mocks.session = sessionContext(["members.read"]);
    mocks.listOrganizationMembers.mockResolvedValueOnce([member("member-1")]);
    mocks.listOrganizationInvitations.mockResolvedValueOnce([]);

    await renderPage();
    await flushPromises();

    expect(document.body.textContent).toContain("Members");
    expect(document.body.textContent).toContain("You're the only member of this organization.");
    expect(document.body.textContent).not.toContain("Invite member");
  });

  it("does not fetch and shows a safe denied state without members.read", async () => {
    mocks.session = sessionContext(["organization.read", "members.manage"]);

    await renderPage();
    await flushPromises();

    expect(mocks.listOrganizationMembers).not.toHaveBeenCalled();
    expect(mocks.listOrganizationInvitations).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("You do not have permission to view organization members.");
    expect(document.body.textContent).not.toContain("Pending invitations");
  });

  it("renders empty states for members and invitations", async () => {
    mocks.listOrganizationMembers.mockResolvedValueOnce([]);
    mocks.listOrganizationInvitations.mockResolvedValueOnce([]);

    await renderPage();
    await flushPromises();

    expect(document.body.textContent).toContain("No members are available for this organization.");
    expect(document.body.textContent).toContain("No pending invitations.");
  });

  it("keeps loaded members visible when invitations fail and retries that section", async () => {
    mocks.listOrganizationMembers.mockResolvedValueOnce([member("member-1"), member("member-2")]);
    mocks.listOrganizationInvitations
      .mockRejectedValueOnce(new ApiError("denied", 403, { statusCode: 403, code: "MEMBER_ACCESS_DENIED", message: "Denied" }))
      .mockResolvedValueOnce([invitation("invite-1")]);

    await renderPage();
    await flushPromises();

    expect(document.body.textContent).toContain("Jane Doe");
    expect(document.body.textContent).toContain("No tenés permisos para administrar miembros de esta organización.");
    await clickButton("Retry invitations");
    await flushPromises();

    expect(mocks.listOrganizationMembers).toHaveBeenCalledTimes(1);
    expect(mocks.listOrganizationInvitations).toHaveBeenCalledTimes(2);
    expect(document.body.textContent).toContain("pending@example.com");
  });

  it("renders a local members error without destroying invitations", async () => {
    mocks.listOrganizationMembers.mockRejectedValueOnce(new Error("network stack trace"));
    mocks.listOrganizationInvitations.mockResolvedValueOnce([invitation("invite-1")]);

    await renderPage();
    await flushPromises();

    expect(document.body.textContent).toContain("No fue posible completar la solicitud. Intentá nuevamente.");
    expect(document.body.textContent).toContain("pending@example.com");
    expect(document.body.textContent).not.toContain("network stack trace");
  });

  it("filters removed members and non-pending invitations from normal read-only lists", async () => {
    mocks.listOrganizationMembers.mockResolvedValueOnce([
      member("member-1"),
      member("removed-member", "REMOVED", "Removed User", "removed@example.com"),
    ]);
    mocks.listOrganizationInvitations.mockResolvedValueOnce([
      invitation("invite-1", "PENDING"),
      invitation("invite-2", "EXPIRED", "expired@example.com"),
    ]);

    await renderPage();
    await flushPromises();

    expect(document.body.textContent).toContain("You're the only member of this organization.");
    expect(document.body.textContent).not.toContain("Removed User");
    expect(document.body.textContent).not.toContain("expired@example.com");
  });

  it("discards obsolete responses when the active tenant changes", async () => {
    const firstMembers = deferred<OrganizationMember[]>();
    const firstInvitations = deferred<OrganizationInvitation[]>();
    const secondMembers = deferred<OrganizationMember[]>();
    const secondInvitations = deferred<OrganizationInvitation[]>();
    mocks.listOrganizationMembers
      .mockReturnValueOnce(firstMembers.promise)
      .mockReturnValueOnce(secondMembers.promise);
    mocks.listOrganizationInvitations
      .mockReturnValueOnce(firstInvitations.promise)
      .mockReturnValueOnce(secondInvitations.promise);

    await renderPage();
    await act(async () => {
      mocks.session = sessionContext(["members.read"], "organization-2", "Organization 2");
      mocks.publishSession?.(mocks.session);
    });
    await act(async () => {
      secondMembers.resolve([member("member-2", "ACTIVE", "New Tenant", "new@example.com")]);
      secondInvitations.resolve([]);
      await Promise.resolve();
    });
    await act(async () => {
      firstMembers.resolve([member("member-1", "ACTIVE", "Old Tenant", "old@example.com")]);
      firstInvitations.resolve([invitation("old-invite", "PENDING", "old-invite@example.com")]);
      await Promise.resolve();
    });

    expect(document.body.textContent).toContain("New Tenant");
    expect(document.body.textContent).not.toContain("Old Tenant");
    expect(document.body.textContent).not.toContain("old-invite@example.com");
  });

  it("exposes semantic desktop and mobile member structures with equivalent information", async () => {
    mocks.listOrganizationMembers.mockResolvedValueOnce([member("member-1"), member("member-2", "SUSPENDED")]);
    mocks.listOrganizationInvitations.mockResolvedValueOnce([]);

    await renderPage();
    await flushPromises();

    const table = document.querySelector("table");
    const mobileList = document.querySelector('ul[aria-label="Organization members"]');
    expect(table?.textContent).toContain("Name");
    expect(table?.textContent).toContain("Email");
    expect(table?.textContent).toContain("Role(s)");
    expect(table?.textContent).toContain("Status");
    expect(table?.parentElement?.className).toContain("hidden md:block");
    expect(mobileList?.className).toContain("md:hidden");
    expect(mobileList?.textContent).toContain("Jane Doe");
    expect(mobileList?.textContent).toContain("jane@example.com");
    expect(mobileList?.textContent).toContain("OWNER");
    expect(mobileList?.textContent).toContain("Active");
  });
});

async function renderPage(): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  await act(async () => {
    root.render(<SessionHarness />);
  });
}

function SessionHarness() {
  const [, rerender] = useReducer((revision: number) => revision + 1, 0);
  useEffect(() => {
    mocks.publishSession = () => rerender();
    return () => {
      mocks.publishSession = null;
    };
  }, []);

  return <MembersPageContent />;
}

async function cleanupMountedRoots(): Promise<void> {
  await act(async () => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });
}

async function flushPromises(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function clickButton(name: string): Promise<void> {
  const button = buttonNamed(name);
  if (!button) throw new Error(`Missing button ${name}`);
  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function buttonNamed(name: string): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll("button")).find(
    (candidate) => candidate.textContent === name,
  ) ?? null;
}

function sessionContext(
  permissions: string[],
  organizationId = "organization-1",
  organizationName = "Organization 1",
): SessionContext {
  const session = sessionWithMemberships(1, false, "access-token", "ACTIVE", permissions);
  if (session.activeOrganization) {
    session.activeOrganization = {
      ...session.activeOrganization,
      id: organizationId,
      name: organizationName,
      slug: organizationId,
    };
  }
  if (session.memberships[0]) {
    session.memberships[0] = {
      ...session.memberships[0],
      organization: {
        ...session.memberships[0].organization,
        id: organizationId,
        name: organizationName,
        slug: organizationId,
      },
    };
  }
  return contextFromSession(session);
}

function member(
  id: string,
  status: OrganizationMember["status"] = "ACTIVE",
  displayName = "Jane Doe",
  email = "jane@example.com",
): OrganizationMember {
  return {
    id,
    status,
    joinedAt: "2026-01-01T00:00:00.000Z",
    jobTitle: null,
    roles: id === "member-2" ? ["MEMBER"] : ["OWNER"],
    user: {
      id: `${id}-user`,
      email,
      displayName,
      firstName: displayName.split(" ")[0] ?? null,
      lastName: displayName.split(" ")[1] ?? null,
    },
  };
}

function invitation(
  id: string,
  status: OrganizationInvitation["status"] = "PENDING",
  email = "pending@example.com",
): OrganizationInvitation {
  return {
    id,
    email,
    status,
    createdAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2026-01-10T00:00:00.000Z",
    invitedBy: {
      id: "admin-user",
      email: "admin@example.com",
      displayName: "Admin User",
    },
    proposedRole: {
      key: "MEMBER",
      name: "Member",
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
