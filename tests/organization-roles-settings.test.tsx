import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionContext } from "@/features/auth/types/auth";

const mocks = vi.hoisted(() => ({
  accessToken: "access-token-1",
  createOrganizationRole: vi.fn(),
  deleteOrganizationRole: vi.fn(),
  getOrganizationMembers: vi.fn(),
  getOrganizationPermissions: vi.fn(),
  getOrganizationRoles: vi.fn(),
  refreshSession: vi.fn(),
  replaceMembershipRoles: vi.fn(),
  session: null as SessionContext | null,
  updateOrganizationRole: vi.fn(),
}));

vi.mock("@/features/auth/hooks/auth-provider", () => ({
  useAuth: () => ({
    accessToken: mocks.accessToken,
    hasPermission: (permission: string) => mocks.session?.activeMembership?.permissions.includes(permission) ?? false,
    refreshSession: mocks.refreshSession,
    session: mocks.session,
  }),
}));

vi.mock("@/features/organizations/api/organization-rbac-api", () => ({
  createOrganizationRole: mocks.createOrganizationRole,
  deleteOrganizationRole: mocks.deleteOrganizationRole,
  getOrganizationMembers: mocks.getOrganizationMembers,
  getOrganizationPermissions: mocks.getOrganizationPermissions,
  getOrganizationRoles: mocks.getOrganizationRoles,
  replaceMembershipRoles: mocks.replaceMembershipRoles,
  updateOrganizationRole: mocks.updateOrganizationRole,
}));

import { OrganizationRolesSettings } from "@/features/organizations/components/organization-roles-settings";

const mountedRoots: Root[] = [];

describe("OrganizationRolesSettings", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.accessToken = "access-token-1";
    mocks.session = buildSession(["members.read", "members.manage"]);
    mocks.refreshSession.mockReset();
    mocks.createOrganizationRole.mockReset();
    mocks.updateOrganizationRole.mockReset();
    mocks.deleteOrganizationRole.mockReset();
    mocks.replaceMembershipRoles.mockReset();
    mocks.getOrganizationRoles.mockReset();
    mocks.getOrganizationPermissions.mockReset();
    mocks.getOrganizationMembers.mockReset();

    mocks.getOrganizationRoles.mockResolvedValue({
      roles: [
        {
          id: "role-owner",
          key: "OWNER",
          name: "Owner",
          description: "System role",
          scope: "ORGANIZATION",
          isSystem: true,
          permissions: ["members.read", "members.manage"],
        },
        {
          id: "role-analyst",
          key: "ANALYST",
          name: "Analyst",
          description: "Can review data",
          scope: "ORGANIZATION",
          isSystem: false,
          permissions: ["analysis.read"],
        },
      ],
    });
    mocks.getOrganizationPermissions.mockResolvedValue({
      permissions: [
        { key: "members.read", description: "Read members" },
        { key: "analysis.read", description: "Read analysis" },
      ],
    });
    mocks.getOrganizationMembers.mockResolvedValue({
      members: [
        {
          id: "membership-1",
          status: "ACTIVE",
          user: {
            id: "user-1",
            email: "user@example.com",
            displayName: "Test User",
            firstName: "Test",
            lastName: "User",
          },
          roles: ["OWNER"],
        },
      ],
    });
    mocks.createOrganizationRole.mockResolvedValue(undefined);
    mocks.replaceMembershipRoles.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await act(async () => {
      while (mountedRoots.length > 0) {
        mountedRoots.pop()?.unmount();
      }
    });
  });

  it("loads roles and keeps system role read-only", async () => {
    await renderComponent();

    expect(document.body.textContent).toContain("Roles & permisos");
    expect(document.body.textContent).toContain("Owner");
    expect(document.body.textContent).toContain("Analyst");
    expect(document.body.textContent).toContain("System");
    expect(mocks.getOrganizationRoles).toHaveBeenCalledWith("access-token-1");
    expect(mocks.getOrganizationPermissions).toHaveBeenCalledWith("access-token-1");
    expect(mocks.getOrganizationMembers).toHaveBeenCalledWith("access-token-1");
    const deleteButtons = Array.from(document.querySelectorAll("button")).filter((button) => button.textContent?.includes("Eliminar"));
    expect(deleteButtons).toHaveLength(1);
  });

  it("blocks functional access without members.read", async () => {
    mocks.session = buildSession([]);

    await renderComponent();

    expect(document.body.textContent).toContain("No tenés permisos para consultar esta administración.");
    expect(mocks.getOrganizationRoles).not.toHaveBeenCalled();
  });

  it("allows create role for members.manage", async () => {
    await renderComponent();

    const nameInput = document.querySelector<HTMLInputElement>("input[required]");
    if (!nameInput) {
      throw new Error("Missing role name input");
    }

    await act(async () => {
      nameInput.value = "Security reviewer";
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      nameInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const permissionLabel = Array.from(document.querySelectorAll("label")).find((label) => label.textContent?.includes("analysis.read"));
    if (!permissionLabel) {
      throw new Error("Missing permission checkbox");
    }
    const permissionInput = permissionLabel.querySelector("input");
    if (!permissionInput) {
      throw new Error("Missing checkbox input");
    }

    await act(async () => {
      permissionInput.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const createButton = findButton("Crear rol");
    await act(async () => {
      createButton.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.createOrganizationRole).toHaveBeenCalledWith(
      "access-token-1",
      expect.objectContaining({
        name: "Security reviewer",
        permissionKeys: ["analysis.read"],
      }),
    );
  });

  it("hides management actions without members.manage", async () => {
    mocks.session = buildSession(["members.read"]);

    await renderComponent();

    expect(document.body.textContent).not.toContain("Crear rol personalizado");
    expect(document.body.textContent).toContain("Solo lectura: no tenés permisos para asignar roles.");
  });

  it("updates member roles and refreshes auth for active membership", async () => {
    await renderComponent();

    const roleCheckbox = Array.from(document.querySelectorAll("article input[type='checkbox']")).at(0);
    if (!roleCheckbox) {
      throw new Error("Missing assignment checkbox");
    }

    await act(async () => {
      roleCheckbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const saveButton = findButton("Guardar roles");
    await act(async () => {
      saveButton.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.replaceMembershipRoles).toHaveBeenCalledWith(
      "access-token-1",
      "membership-1",
      { roleIds: ["role-analyst"] },
    );
    expect(mocks.refreshSession).toHaveBeenCalled();
  });
});

async function renderComponent(): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);

  await act(async () => {
    root.render(<OrganizationRolesSettings />);
    await Promise.resolve();
    await Promise.resolve();
  });
}

function buildSession(permissions: string[]): SessionContext {
  return {
    user: {
      id: "user-1",
      email: "user@example.com",
      displayName: "Test User",
      firstName: "Test",
      lastName: "User",
    },
    activeOrganization: {
      id: "organization-1",
      name: "Organization 1",
      slug: "organization-1",
    },
    activeMembership: {
      id: "membership-1",
      status: "ACTIVE",
      roles: ["OWNER"],
      permissions,
    },
    memberships: [
      {
        id: "membership-1",
        status: "ACTIVE",
        organization: {
          id: "organization-1",
          name: "Organization 1",
          slug: "organization-1",
        },
        roles: ["OWNER"],
        permissions,
      },
    ],
    requiresOrganizationSelection: false,
  };
}

function findButton(label: string): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll("button")).find((candidate) => candidate.textContent?.trim() === label);
  if (!button) {
    throw new Error(`Missing ${label} button`);
  }

  return button;
}
