import { act, useEffect, useReducer } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import type { SessionContext } from "@/features/auth/types/auth";
import { DashboardContent } from "@/features/workspace/components/dashboard-content";
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";
import { contextFromSession, selectedSessionWithMultipleMemberships, sessionWithMemberships } from "./auth-fixtures";

const mocks = vi.hoisted(() => ({
  chooseOrganization: vi.fn(),
  publishSession: null as ((session: SessionContext) => void) | null,
  replace: vi.fn(),
  session: null as SessionContext | null,
  signOut: vi.fn(),
}));

vi.mock("@/features/auth/hooks/auth-provider", () => ({
  useAuth: () => ({
    session: mocks.session,
    chooseOrganization: mocks.chooseOrganization,
    signOut: mocks.signOut,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => "/dashboard",
}));

import { OrganizationSwitcher } from "@/features/workspace/components/organization-switcher";

const mountedRoots: Root[] = [];

describe("OrganizationSwitcher", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.chooseOrganization.mockReset();
    mocks.publishSession = null;
    mocks.replace.mockReset();
    mocks.signOut.mockReset();
    mocks.session = contextFromSession(selectedSessionWithMultipleMemberships());
  });

  afterEach(async () => {
    await act(async () => {
      while (mountedRoots.length > 0) {
        mountedRoots.pop()?.unmount();
      }
    });
    document.body.innerHTML = "";
  });

  it("retains static context when fewer than two memberships are active", async () => {
    const session = sessionWithMemberships(1, false);
    session.memberships.push({
      id: "inactive-membership",
      status: "INACTIVE",
      organization: { id: "inactive-organization", name: "Inactive organization", slug: "inactive-organization" },
      roles: ["OWNER"],
      permissions: ["members.read", "members.manage"],
    });
    mocks.session = contextFromSession(session);
    await renderSwitcher();

    expect(document.querySelector("button")).toBeNull();
    expect(document.body.textContent).toContain("Organization 1");
    expect(document.body.textContent).not.toContain("Inactive organization");
  });

  it("shows active memberships only and does not request the current organization", async () => {
    mocks.session = contextFromSession(selectedSessionWithMultipleMemberships());
    await renderSwitcher();
    const trigger = organizationTrigger();

    expect(trigger.textContent).toContain("Organización");
    expect(trigger.textContent).toContain("Organization 321");
    expect(trigger.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(trigger.textContent).not.toMatch(/expand_more/i);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await openMenu();

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.textContent).toContain("Organization 123");
    expect(document.body.textContent).toContain("Organization 321");
    const activeItem = document.querySelector("[aria-current=true]");
    expect(activeItem?.textContent).toContain("Organization 321");
    expect(activeItem?.textContent).toContain("Organización activa");
    expect(document.body.textContent).not.toContain("OWNER");
    await selectMenuItem("Organization 321");

    expect(mocks.chooseOrganization).not.toHaveBeenCalled();
  });

  it("holds a synchronous single-flight guard for two immediate non-active selections", async () => {
    const pendingSelection = deferred<void>();
    mocks.chooseOrganization.mockReturnValue(pendingSelection.promise);
    mocks.session = sessionWithThreeActiveMemberships();
    await renderSwitcher();
    await openMenu();

    await selectMenuItemsImmediately("Organization 123", "Organization 321");
    expect(mocks.chooseOrganization).toHaveBeenCalledTimes(1);
    expect(mocks.chooseOrganization).toHaveBeenCalledWith("org123");
    expect(document.body.textContent).toContain("Cambiando organización...");

    await settle(() => pendingSelection.resolve());
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("supports keyboard navigation, Escape, and focus restoration", async () => {
    await renderSwitcher();
    const trigger = organizationTrigger();
    trigger.focus();

    await pressKey(trigger, "Enter");
    const items = menuItems();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(items[0]);

    await pressKey(items[0], "ArrowDown");
    expect(document.activeElement).toBe(items[1]);

    await pressKey(items[1], "Escape");
    expect(document.querySelector('[role="menu"]')).toBeNull();
    await waitForFocus(trigger);
    expect(document.activeElement).toBe(trigger);
  });

  it("closes the mobile dropdown and aside before navigation and renders replacement roles", async () => {
    const replacement = selectedSessionWithMultipleMemberships();
    replacement.activeOrganization = replacement.memberships[0].organization;
    replacement.activeMembership = {
      id: replacement.memberships[0].id,
      status: replacement.memberships[0].status,
      roles: replacement.memberships[0].roles,
      permissions: replacement.memberships[0].permissions,
    };
    mocks.chooseOrganization.mockImplementation(async () => {
      mocks.publishSession?.(contextFromSession(replacement));
    });
    mocks.replace.mockImplementation(() => {
      expect(document.querySelector("#workspace-mobile-navigation")).toBeNull();
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(document.body.textContent).toContain("Organization 123");
      expect(document.body.textContent).toContain("OWNER");
    });
    await renderWorkspace();

    await clickButton("Abrir navegación");
    const aside = document.querySelector("#workspace-mobile-navigation");
    if (!aside) throw new Error("Missing mobile workspace navigation");
    await openMenu(aside);
    await selectMenuItem("Organization 123");

    expect(mocks.chooseOrganization).toHaveBeenCalledWith("org123");
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
    expect(document.body.textContent).not.toContain("Sin roles asignados.");
  });

  it("keeps the menu available for a retry after denial", async () => {
    mocks.chooseOrganization.mockRejectedValue(
      new ApiError("denied", 403, {
        statusCode: 403,
        code: "ORGANIZATION_ACCESS_DENIED",
        message: "Denied",
      }),
    );
    await renderSwitcher();
    await openMenu();
    await selectMenuItem("Organization 123");
    await settle(() => undefined);

    expect(document.body.textContent).toContain("No tenés acceso a esa organización.");
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});

async function renderSwitcher(): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  await act(async () => {
    root.render(<OrganizationSwitcher />);
  });
}

async function renderWorkspace(): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  await act(async () => {
    root.render(<AuthSessionHarness />);
  });
}

function AuthSessionHarness() {
  const [, rerender] = useReducer((revision: number) => revision + 1, 0);
  useEffect(() => {
    mocks.publishSession = (session) => {
      mocks.session = session;
      rerender();
    };

    return () => {
      mocks.publishSession = null;
    };
  }, []);

  return (
    <WorkspaceShell>
      <DashboardContent />
    </WorkspaceShell>
  );
}

async function openMenu(scope: ParentNode = document): Promise<void> {
  const trigger = scope.querySelector('button[aria-label^="Cambiar organización"]');
  if (!trigger) throw new Error("Missing organization switcher trigger");
  await act(async () => {
    trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
  });
}

async function selectMenuItemsImmediately(firstName: string, secondName: string): Promise<void> {
  const [first, second] = [firstName, secondName].map(findMenuItem);
  await act(async () => {
    first.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    second.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function findMenuItem(name: string): Element {
  const item = menuItems().find((candidate) => candidate.textContent?.includes(name));
  if (!item) throw new Error(`Missing ${name} menu item`);
  return item;
}

function menuItems(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

function organizationTrigger(): HTMLButtonElement {
  const trigger = document.querySelector<HTMLButtonElement>('button[aria-label^="Cambiar organización"]');
  if (!trigger) throw new Error("Missing organization switcher trigger");
  return trigger;
}

async function pressKey(target: Element, key: string): Promise<void> {
  await act(async () => {
    target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, code: key, key }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function waitForFocus(target: Element): Promise<void> {
  await act(async () => {
    for (let attempt = 0; attempt < 5 && document.activeElement !== target; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  });
}

async function clickButton(accessibleName: string): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>(`button[aria-label="${accessibleName}"]`);
  if (!button) throw new Error(`Missing ${accessibleName} button`);
  await act(async () => {
    button.click();
  });
}

function sessionWithThreeActiveMemberships(): SessionContext {
  const session = selectedSessionWithMultipleMemberships();
  session.memberships.push({
    id: "membership999",
    status: "ACTIVE",
    organization: { id: "org999", name: "Organization 999", slug: "organization-999" },
    roles: ["MEMBER"],
    permissions: ["members.read"],
  });
  session.activeOrganization = session.memberships[2].organization;
  session.activeMembership = {
    id: session.memberships[2].id,
    status: session.memberships[2].status,
    roles: session.memberships[2].roles,
    permissions: session.memberships[2].permissions,
  };
  return contextFromSession(session);
}

async function selectMenuItem(name: string): Promise<void> {
  const item = Array.from(document.querySelectorAll('[role="menuitem"]')).find(
    (candidate) => candidate.textContent?.includes(name),
  );
  if (!item) throw new Error(`Missing ${name} menu item`);
  await act(async () => {
    item.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
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

async function settle(action: () => void) {
  await act(async () => {
    action();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await Promise.resolve();
  });
}
