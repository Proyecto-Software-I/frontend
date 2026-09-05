import { act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionContext } from "@/features/auth/types/auth";
import type { InvitationPreview } from "@/features/organizations/types/organizations";
import { ApiError } from "@/lib/api/api-error";

const mocks = vi.hoisted(() => ({
  acceptInvitation: vi.fn(),
  chooseOrganization: vi.fn(),
  getAccessToken: vi.fn(() => "access-token"),
  getInvitationPreview: vi.fn(),
  publishAuth: null as (() => void) | null,
  reloadSession: vi.fn(),
  replace: vi.fn(),
  session: null as SessionContext | null,
  signOut: vi.fn(),
  status: "anonymous" as "anonymous" | "authenticated" | "selection-required",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/features/auth/hooks/auth-provider", () => ({
  useAuth: () => ({
    chooseOrganization: mocks.chooseOrganization,
    getAccessToken: mocks.getAccessToken,
    reloadSession: mocks.reloadSession,
    session: mocks.session,
    signOut: mocks.signOut,
    status: mocks.status,
  }),
}));

vi.mock("@/features/organizations/api/organization-members-api", () => ({
  acceptInvitation: mocks.acceptInvitation,
  getInvitationPreview: mocks.getInvitationPreview,
}));

import { InvitationPageContent } from "@/features/organizations/components/invitation-page-content";

const roots: Root[] = [];
const preview: InvitationPreview = {
  email: "member@example.com",
  organization: { name: "Trusted Organization", slug: "trusted-org" },
  expiresAt: "2026-01-10T00:00:00.000Z",
};

describe("InvitationPageContent", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.acceptInvitation.mockReset();
    mocks.chooseOrganization.mockReset();
    mocks.getAccessToken.mockReset();
    mocks.getAccessToken.mockReturnValue("access-token");
    mocks.getInvitationPreview.mockReset();
    mocks.publishAuth = null;
    mocks.reloadSession.mockReset();
    mocks.replace.mockReset();
    mocks.session = null;
    mocks.signOut.mockReset();
    mocks.status = "anonymous";
  });

  afterEach(async () => {
    await cleanup();
    document.body.innerHTML = "";
  });

  it("loads public preview without Auth credentials and renders trusted preview data", async () => {
    const flight = deferred<InvitationPreview>();
    mocks.getInvitationPreview.mockReturnValueOnce(flight.promise);

    await render("token-1");
    expect(document.body.textContent).toContain("Cargando invitación...");
    await act(async () => {
      flight.resolve(preview);
      await Promise.resolve();
    });
    await flush();

    expect(mocks.getInvitationPreview).toHaveBeenCalledWith("token-1");
    expect(mocks.getAccessToken).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Trusted Organization");
    expect(document.body.textContent).toContain("member@example.com");
    expect(document.body.textContent).toContain("Iniciar sesión");
    expect(document.body.textContent).toContain("Crear cuenta y unirme a la organización");
    expect(linkHref("Iniciar sesión")).toBe("/auth/login?returnTo=%2Finvite%2Ftoken-1");
    expect(linkHref("Crear cuenta y unirme a la organización")).toBe("/auth/register?invitationToken=token-1");
  });

  it.each([
    ["INVITATION_NOT_FOUND", "Esta invitación ya no es válida."],
    ["INVITATION_EXPIRED", "Esta invitación ha expirado."],
    ["INVITATION_REVOKED", "Esta invitación ha sido revocada."],
    ["INVITATION_ALREADY_ACCEPTED", "Esta invitación ya fue aceptada."],
  ])("renders safe functional preview state for %s", async (code, message) => {
    mocks.getInvitationPreview.mockRejectedValueOnce(apiError(code));
    await render("token-1");
    await flush();

    expect(document.body.textContent).toContain(message);
    expect(document.body.textContent).not.toContain("Unirme a");
    expect(document.body.textContent).not.toContain("Crear cuenta y unirme a la organización");
  });

  it("retries unexpected preview failures and discards stale token results", async () => {
    mocks.getInvitationPreview
      .mockRejectedValueOnce(new Error("network detail"))
      .mockResolvedValueOnce(preview);
    await render("token-1");
    await flush();
    expect(document.body.textContent).toContain("No pudimos cargar esta invitación.");
    await click("Reintentar");
    await flush();
    expect(mocks.getInvitationPreview).toHaveBeenCalledTimes(2);
    expect(document.body.textContent).toContain("Trusted Organization");

    await cleanup();
    const oldPreview = deferred<InvitationPreview>();
    const newPreview = deferred<InvitationPreview>();
    mocks.getInvitationPreview.mockReset();
    mocks.getInvitationPreview.mockReturnValueOnce(oldPreview.promise).mockReturnValueOnce(newPreview.promise);
    await renderWithTokenHarness();
    await act(async () => {
      mocks.publishAuth?.();
    });
    await act(async () => {
      newPreview.resolve({ ...preview, organization: { ...preview.organization, name: "New Organization" } });
      await Promise.resolve();
    });
    await act(async () => {
      oldPreview.resolve({ ...preview, organization: { ...preview.organization, name: "Old Organization" } });
      await Promise.resolve();
    });
    expect(document.body.textContent).toContain("New Organization");
    expect(document.body.textContent).not.toContain("Old Organization");
  });

  it("accepts with the matching account and selects the real active membership organization ID", async () => {
    mocks.status = "authenticated";
    mocks.session = session("member@example.com", []);
    mocks.getInvitationPreview.mockResolvedValueOnce(preview);
    mocks.acceptInvitation.mockResolvedValueOnce(undefined);
    mocks.reloadSession.mockResolvedValueOnce(session("member@example.com", [
      { id: "membership-1", status: "ACTIVE", organization: { id: "real-organization-id", name: "Trusted Organization", slug: "trusted-org" }, roles: ["MEMBER"] },
    ]));
    mocks.chooseOrganization.mockResolvedValueOnce(undefined);

    await render("token-1");
    await flush();
    expect(button("Unirme a Trusted Organization")).not.toBeNull();
    await click("Unirme a Trusted Organization");
    await flush();

    expect(mocks.acceptInvitation).toHaveBeenCalledWith("access-token", "token-1");
    expect(mocks.reloadSession).toHaveBeenCalledTimes(1);
    expect(mocks.chooseOrganization).toHaveBeenCalledWith("real-organization-id");
    expect(mocks.chooseOrganization).not.toHaveBeenCalledWith("trusted-org");
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("normalizes account and invitation emails before offering Join", async () => {
    mocks.status = "authenticated";
    mocks.session = session(" MEMBER@EXAMPLE.COM ", []);
    mocks.getInvitationPreview.mockResolvedValueOnce(preview);

    await render("token-1");
    await flush();

    expect(button("Unirme a Trusted Organization")).not.toBeNull();
    expect(button("Cerrar sesión / usar otra cuenta")).toBeNull();
  });

  it("blocks repeated acceptance while the request is pending", async () => {
    mocks.status = "authenticated";
    mocks.session = session("member@example.com", []);
    mocks.getInvitationPreview.mockResolvedValueOnce(preview);
    const acceptFlight = deferred<void>();
    mocks.acceptInvitation.mockReturnValueOnce(acceptFlight.promise);

    await render("token-1");
    await flush();
    const join = button("Unirme a Trusted Organization");
    if (!join) throw new Error("Missing join action");
    await act(async () => {
      join.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      join.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(mocks.acceptInvitation).toHaveBeenCalledTimes(1);
  });

  it("does not re-accept after membership resolution or selection fails", async () => {
    mocks.status = "authenticated";
    mocks.session = session("member@example.com", []);
    mocks.getInvitationPreview.mockResolvedValueOnce(preview);
    mocks.acceptInvitation.mockResolvedValueOnce(undefined);
    mocks.reloadSession
      .mockResolvedValueOnce(session("member@example.com", []))
      .mockResolvedValueOnce(session("member@example.com", [
        { id: "membership-1", status: "ACTIVE", organization: { id: "real-id", name: "Trusted Organization", slug: "trusted-org" }, roles: ["MEMBER"] },
      ]));
    mocks.chooseOrganization.mockRejectedValueOnce(new Error("switch failed"));

    await render("token-1");
    await flush();
    await click("Unirme a Trusted Organization");
    await flush();
    expect(mocks.chooseOrganization).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("La invitación fue aceptada, pero el acceso a tu organización aún se está sincronizando.");
    await click("Reintentar configuración");
    await flush();
    expect(mocks.acceptInvitation).toHaveBeenCalledTimes(1);
    expect(mocks.chooseOrganization).toHaveBeenCalledWith("real-id");
    expect(document.body.textContent).toContain("No pudimos completar esta acción de invitación. Inténtalo nuevamente.");
  });

  it("does not offer Join to the wrong account and signs out through Auth", async () => {
    mocks.status = "authenticated";
    mocks.session = session("other@example.com", []);
    mocks.getInvitationPreview.mockResolvedValueOnce(preview);
    mocks.signOut.mockResolvedValueOnce(undefined);

    await render("token-1");
    await flush();
    expect(document.body.textContent).toContain("Esta invitación fue enviada a member@example.com.");
    expect(document.body.textContent).toContain("Actualmente has iniciado sesión como other@example.com.");
    expect(button("Unirme a Trusted Organization")).toBeNull();
    await click("Cerrar sesión / usar otra cuenta");
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(mocks.acceptInvitation).not.toHaveBeenCalled();
  });
});

async function render(token: string): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(<InvitationPageContent token={token} />);
  });
}

function TokenHarness() {
  const [token, setToken] = useState("old-token");
  useEffect(() => {
    mocks.publishAuth = () => setToken("new-token");
    return () => {
      mocks.publishAuth = null;
    };
  }, []);
  return <InvitationPageContent token={token} />;
}

async function renderWithTokenHarness(): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(<TokenHarness />);
  });
}

function session(email: string, memberships: SessionContext["memberships"]): SessionContext {
  return {
    user: { id: "user-1", email, displayName: "Member", firstName: "Member", lastName: "User" },
    activeOrganization: null,
    activeMembership: null,
    memberships,
    requiresOrganizationSelection: memberships.length > 0,
  };
}

function apiError(code: string): ApiError {
  return new ApiError("raw token", 400, { statusCode: 400, code, message: "raw token" });
}

async function cleanup(): Promise<void> {
  await act(async () => {
    while (roots.length > 0) roots.pop()?.unmount();
  });
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function click(name: string): Promise<void> {
  const target = button(name) ?? Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find((link) => link.textContent === name);
  if (!target) throw new Error(`Missing action ${name}`);
  await act(async () => {
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function button(name: string): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find((candidate) => candidate.textContent === name) ?? null;
}

function linkHref(name: string): string | null {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find((link) => link.textContent === name)?.getAttribute("href") ?? null;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise; });
  return { promise, resolve };
}
