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
  createOrganizationInvitation: vi.fn(),
  getAccessToken: vi.fn(() => "access-token"),
  listOrganizationInvitations: vi.fn(),
  listOrganizationMembers: vi.fn(),
  publishSession: null as ((session: SessionContext) => void) | null,
  reactivateOrganizationMember: vi.fn(),
  removeOrganizationMember: vi.fn(),
  revokeOrganizationInvitation: vi.fn(),
  session: null as SessionContext | null,
  suspendOrganizationMember: vi.fn(),
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
  createOrganizationInvitation: mocks.createOrganizationInvitation,
  listOrganizationInvitations: mocks.listOrganizationInvitations,
  listOrganizationMembers: mocks.listOrganizationMembers,
  reactivateOrganizationMember: mocks.reactivateOrganizationMember,
  removeOrganizationMember: mocks.removeOrganizationMember,
  revokeOrganizationInvitation: mocks.revokeOrganizationInvitation,
  suspendOrganizationMember: mocks.suspendOrganizationMember,
}));

import { MembersPageContent } from "@/features/organizations/components/members-page-content";

const mountedRoots: Root[] = [];

describe("MembersPageContent", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.createOrganizationInvitation.mockReset();
    mocks.getAccessToken.mockReset();
    mocks.getAccessToken.mockReturnValue("access-token");
    mocks.listOrganizationInvitations.mockReset();
    mocks.listOrganizationMembers.mockReset();
    mocks.publishSession = null;
    mocks.reactivateOrganizationMember.mockReset();
    mocks.removeOrganizationMember.mockReset();
    mocks.revokeOrganizationInvitation.mockReset();
    mocks.session = sessionContext(["organization.read", "members.read"]);
    mocks.suspendOrganizationMember.mockReset();
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

  it("shows Invite member with members.manage and validates that email is the only business field", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"]);
    mocks.listOrganizationMembers.mockResolvedValueOnce([member("member-1")]);
    mocks.listOrganizationInvitations.mockResolvedValueOnce([]);

    await renderPage();
    await flushPromises();
    await clickButton("Invite member");

    const inputs = Array.from(document.querySelectorAll("input"));
    expect(inputs).toHaveLength(1);
    expect(inputs[0]?.getAttribute("name")).toBe("email");
    await clickButton("Create invitation");

    expect(mocks.createOrganizationInvitation).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Enter a valid email address.");
  });

  it("creates an invitation once, refetches, shows and clears the one-time acceptanceUrl", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"]);
    mocks.listOrganizationMembers.mockResolvedValueOnce([member("member-1")]);
    mocks.listOrganizationInvitations
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([invitation("invite-1")]);
    mocks.createOrganizationInvitation.mockResolvedValueOnce({
      ...invitation("invite-1"),
      acceptanceUrl: "/invite/secret-token",
    });
    const storageSetItem = vi.spyOn(Storage.prototype, "setItem");

    await renderPage();
    await flushPromises();
    await clickButton("Invite member");
    await setInputValue(inputNamed("email"), " Pending@Example.com ");
    await clickButton("Create invitation");
    await flushPromises();

    expect(mocks.createOrganizationInvitation).toHaveBeenCalledTimes(1);
    expect(mocks.createOrganizationInvitation).toHaveBeenCalledWith("access-token", { email: "pending@example.com" });
    expect(mocks.listOrganizationInvitations).toHaveBeenCalledTimes(2);
    expect(document.body.textContent).toContain("Invitation created.");
    expect(document.body.textContent).toContain("Share this secure link with the invited person.");
    expect((inputNamed("Invitation link") as HTMLInputElement).value).toBe("/invite/secret-token");
    expect(document.body.textContent).not.toContain("Email sent successfully");
    expect(storageSetItem).not.toHaveBeenCalled();

    await clickButton("Close");
    expect(document.body.textContent).not.toContain("/invite/secret-token");
    await clickButton("Invite member");
    expect(document.body.textContent).not.toContain("/invite/secret-token");
    storageSetItem.mockRestore();
  });

  it("blocks double invitation submit while pending and maps duplicate/member errors", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"]);
    mocks.listOrganizationMembers.mockResolvedValue([member("member-1")]);
    mocks.listOrganizationInvitations.mockResolvedValue([]);
    const createFlight = deferred<OrganizationInvitation & { acceptanceUrl: string }>();
    mocks.createOrganizationInvitation.mockReturnValueOnce(createFlight.promise);

    await renderPage();
    await flushPromises();
    await clickButton("Invite member");
    await setInputValue(inputNamed("email"), "pending@example.com");
    await clickButton("Create invitation");
    await clickButton("Creating invitation...");

    expect(mocks.createOrganizationInvitation).toHaveBeenCalledTimes(1);
    await act(async () => {
      createFlight.resolve({ ...invitation("invite-1"), acceptanceUrl: "/invite/token" });
      await Promise.resolve();
    });
    await flushPromises();

    await clickButton("Close");
    mocks.createOrganizationInvitation.mockRejectedValueOnce(new ApiError("duplicate", 409, { statusCode: 409, code: "INVITATION_ALREADY_PENDING", message: "raw" }));
    await clickButton("Invite member");
    await setInputValue(inputNamed("email"), "pending@example.com");
    await clickButton("Create invitation");
    await flushPromises();
    expect(document.body.textContent).toContain("Ya existe una invitación pendiente para ese email.");

    mocks.createOrganizationInvitation.mockRejectedValueOnce(new ApiError("member", 409, { statusCode: 409, code: "MEMBER_ALREADY_EXISTS", message: "raw" }));
    await clickButton("Create invitation");
    await flushPromises();
    expect(document.body.textContent).toContain("La persona ya pertenece a esta organización.");
  });

  it("copies acceptanceUrl with success and failure feedback without storage writes", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"]);
    mocks.listOrganizationMembers.mockResolvedValue([member("member-1")]);
    mocks.listOrganizationInvitations.mockResolvedValue([]);
    mocks.createOrganizationInvitation.mockResolvedValue({ ...invitation("invite-1"), acceptanceUrl: "/invite/token" });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const storageSetItem = vi.spyOn(Storage.prototype, "setItem");

    await renderPage();
    await flushPromises();
    await clickButton("Invite member");
    await setInputValue(inputNamed("email"), "pending@example.com");
    await clickButton("Create invitation");
    await flushPromises();
    await clickButton("Copy invitation link");
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith("/invite/token");
    expect(document.body.textContent).toContain("Invitation link copied.");
    expect(storageSetItem).not.toHaveBeenCalled();

    writeText.mockRejectedValueOnce(new Error("denied"));
    await clickButton("Copy invitation link");
    await flushPromises();
    expect(document.body.textContent).toContain("We couldn't copy the link. Select and copy it manually.");
    storageSetItem.mockRestore();
  });

  it("revokes only pending invitations after confirmation, refetches, and preserves on error", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"]);
    mocks.listOrganizationMembers.mockResolvedValue([member("member-1")]);
    mocks.listOrganizationInvitations
      .mockResolvedValueOnce([invitation("invite-1")])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([invitation("invite-2")]);
    mocks.revokeOrganizationInvitation.mockResolvedValueOnce(undefined);

    await renderPage();
    await flushPromises();
    expect(buttonNamed("Revoke")).not.toBeNull();
    await clickButton("Revoke");
    expect(document.body.textContent).toContain("Revoke invitation?");
    await clickButton("Cancel");
    expect(mocks.revokeOrganizationInvitation).not.toHaveBeenCalled();

    await clickButton("Revoke");
    expect(document.body.textContent).toContain("pending@example.com");
    await clickLastButton("Revoke");
    await flushPromises();
    expect(mocks.revokeOrganizationInvitation).toHaveBeenCalledWith("access-token", "invite-1");
    expect(mocks.listOrganizationInvitations).toHaveBeenCalledTimes(2);

    await cleanupMountedRoots();
    document.body.innerHTML = "";
    mocks.listOrganizationMembers.mockReset();
    mocks.listOrganizationInvitations.mockReset();
    mocks.listOrganizationMembers.mockResolvedValueOnce([member("member-1")]);
    mocks.listOrganizationInvitations.mockResolvedValueOnce([invitation("invite-2")]);
    mocks.revokeOrganizationInvitation.mockRejectedValueOnce(new ApiError("gone", 404, { statusCode: 404, code: "INVITATION_NOT_FOUND", message: "raw" }));
    await renderPage();
    await flushPromises();
    await clickButton("Revoke");
    await clickLastButton("Revoke");
    await flushPromises();
    expect(document.body.textContent).toContain("pending@example.com");
    expect(document.body.textContent).toContain("La invitación no existe o ya no está disponible.");
  });

  it("blocks double revoke while pending", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"]);
    mocks.listOrganizationMembers.mockResolvedValue([member("member-1")]);
    mocks.listOrganizationInvitations.mockResolvedValue([invitation("invite-1")]);
    const revokeFlight = deferred<void>();
    mocks.revokeOrganizationInvitation.mockReturnValueOnce(revokeFlight.promise);

    await renderPage();
    await flushPromises();
    await clickButton("Revoke");
    await clickLastButton("Revoke");
    await clickButton("Revoking...");

    expect(mocks.revokeOrganizationInvitation).toHaveBeenCalledTimes(1);
  });

  it("shows member actions by status only with members.manage on desktop and mobile", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"]);
    mocks.listOrganizationMembers.mockResolvedValueOnce([
      member("member-1", "ACTIVE"),
      member("member-2", "SUSPENDED"),
      member("member-3", "REMOVED", "Removed User", "removed@example.com"),
    ]);
    mocks.listOrganizationInvitations.mockResolvedValueOnce([]);

    await renderPage();
    await flushPromises();

    const table = document.querySelector("table");
    const mobileList = document.querySelector('ul[aria-label="Organization members"]');
    expect(table?.textContent).toContain("Actions");
    expect(table?.textContent).toContain("Suspend");
    expect(table?.textContent).toContain("Reactivate");
    expect(table?.textContent).toContain("Remove");
    expect(mobileList?.textContent).toContain("Suspend");
    expect(mobileList?.textContent).toContain("Reactivate");
    expect(mobileList?.textContent).toContain("Remove");
    expect(document.body.textContent).not.toContain("Removed User");
  });

  it("confirms suspend/remove, allows cancel, refetches after success, and preserves state on errors", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"], "organization-1", "Example Org");
    mocks.listOrganizationMembers
      .mockResolvedValueOnce([member("member-1", "ACTIVE")])
      .mockResolvedValueOnce([member("member-1", "SUSPENDED")])
      .mockResolvedValueOnce([member("member-1", "ACTIVE")]);
    mocks.listOrganizationInvitations.mockResolvedValue([]);
    mocks.suspendOrganizationMember.mockResolvedValueOnce(undefined);
    mocks.removeOrganizationMember.mockRejectedValueOnce(new ApiError("last", 409, { statusCode: 409, code: "LAST_OWNER_REQUIRED", message: "raw" }));

    await renderPage();
    await flushPromises();
    await clickButton("Suspend");
    expect(document.body.textContent).toContain("Suspend member?");
    await clickButton("Cancel");
    expect(mocks.suspendOrganizationMember).not.toHaveBeenCalled();
    await clickButton("Suspend");
    await clickButton("Suspend member");
    await flushPromises();
    expect(mocks.suspendOrganizationMember).toHaveBeenCalledWith("access-token", "member-1");
    expect(mocks.listOrganizationMembers).toHaveBeenCalledTimes(2);

    await clickButton("Remove");
    expect(document.body.textContent).toContain("Remove Jane Doe from Example Org?");
    expect(document.body.textContent).toContain("They will lose access to this organization.");
    await clickButton("Remove member");
    await flushPromises();
    expect(document.body.textContent).toContain("This action can't be completed because the organization must have at least one active owner.");
    expect(document.body.textContent).toContain("Jane Doe");
  });

  it("reactivates suspended members pessimistically and preserves state on failure", async () => {
    mocks.session = sessionContext(["members.read", "members.manage"]);
    mocks.listOrganizationMembers
      .mockResolvedValueOnce([member("member-2", "SUSPENDED")])
      .mockResolvedValueOnce([member("member-2", "ACTIVE")]);
    mocks.listOrganizationInvitations.mockResolvedValue([]);
    mocks.reactivateOrganizationMember.mockResolvedValueOnce(undefined);

    await renderPage();
    await flushPromises();
    await clickButton("Reactivate");
    await flushPromises();
    expect(mocks.reactivateOrganizationMember).toHaveBeenCalledWith("access-token", "member-2");
    expect(mocks.listOrganizationMembers).toHaveBeenCalledTimes(2);

    await cleanupMountedRoots();
    document.body.innerHTML = "";
    mocks.listOrganizationMembers.mockReset();
    mocks.listOrganizationInvitations.mockReset();
    mocks.listOrganizationMembers.mockResolvedValueOnce([member("member-2", "SUSPENDED")]);
    mocks.listOrganizationInvitations.mockResolvedValueOnce([]);
    mocks.reactivateOrganizationMember.mockRejectedValueOnce(new ApiError("missing", 404, { statusCode: 404, code: "MEMBERSHIP_NOT_FOUND", message: "raw" }));
    await renderPage();
    await flushPromises();
    await clickButton("Reactivate");
    await flushPromises();
    expect(document.body.textContent).toContain("El miembro no existe o ya no está disponible.");
    expect(document.body.textContent).toContain("Suspended");
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

async function clickLastButton(name: string): Promise<void> {
  const buttons = Array.from(document.querySelectorAll("button")).filter(
    (candidate) => candidate.textContent === name,
  );
  const button = buttons.at(-1);
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

function inputNamed(name: string): HTMLInputElement {
  const input = Array.from(document.querySelectorAll("input")).find(
    (candidate) =>
      candidate.getAttribute("name") === name ||
      candidate.closest("label")?.textContent?.includes(name),
  );
  if (!input) throw new Error(`Missing input ${name}`);
  return input;
}

async function setInputValue(input: HTMLInputElement, value: string): Promise<void> {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
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
