import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { isSessionContext } from "@/features/auth/types/auth";
import {
  contextFromSession,
  refreshResponse,
  sessionWithMemberships,
  sessionWithZeroActiveMemberships,
} from "./auth-fixtures";

const mocks = vi.hoisted(() => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  register: vi.fn(),
  selectOrganization: vi.fn(),
  pathname: "/auth/login",
}));

vi.mock("@/features/auth/api/auth-api", () => ({
  getMe: mocks.getMe,
  login: mocks.login,
  logout: mocks.logout,
  refresh: mocks.refresh,
  register: mocks.register,
  selectOrganization: mocks.selectOrganization,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

import { AuthProvider, useAuth } from "@/features/auth/hooks/auth-provider";

function Probe() {
  const auth = useAuth();
  return (
    <div
      data-status={auth.status}
      data-notice={auth.notice ?? ""}
      data-organization={auth.session?.activeOrganization?.id ?? ""}
    >
      <button onClick={() => void auth.signUp({ email: "new@example.com", password: "password", firstName: "New", lastName: "User", organizationName: "New Org" }).catch(() => undefined)}>sign-up</button>
      <button onClick={() => void auth.chooseOrganization("organization-2").catch(() => undefined)}>choose</button>
      <button onClick={() => void auth.signOut().catch(() => undefined)}>sign-out</button>
    </div>
  );
}

function probe() {
  return document.querySelector("div[data-status]");
}

function attribute(name: string) {
  return probe()?.getAttribute(name);
}

async function renderProvider(): Promise<Root> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  await act(async () => {
    root.render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await Promise.resolve();
  });
  return root;
}

async function click(label: string) {
  const button = Array.from(document.querySelectorAll("button")).find(
    (candidate) => candidate.textContent === label,
  );
  if (!button) throw new Error(`Missing ${label} button`);
  await act(async () => {
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const mountedRoots: Root[] = [];

describe("AuthProvider state transitions", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.pathname = "/auth/login";
    Object.values(mocks).forEach((mock) => {
      if (typeof mock !== "string") mock.mockReset();
    });
    const session = sessionWithMemberships(1);
    mocks.refresh.mockResolvedValue(refreshResponse());
    mocks.getMe.mockResolvedValue(contextFromSession(session));
    mocks.logout.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await act(async () => {
      while (mountedRoots.length > 0) {
        mountedRoots.pop()?.unmount();
      }
    });
    document.body.innerHTML = "";
  });

  it("bootstraps one active membership as authenticated", async () => {
    await renderProvider();

    expect(attribute("data-status")).toBe("authenticated");
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(mocks.getMe).toHaveBeenCalledWith("refresh-token-1");
  });

  it("requires selection for multiple memberships and replaces the session after selection", async () => {
    mocks.getMe.mockResolvedValue(contextFromSession(sessionWithMemberships(2)));
    mocks.selectOrganization.mockResolvedValue(
      sessionWithMemberships(1, false, "selected-access-token"),
    );
    await renderProvider();

    expect(attribute("data-status")).toBe("selection-required");
    await click("choose");
    expect(attribute("data-status")).toBe("authenticated");
    expect(attribute("data-organization")).toBe("organization-1");
    expect(mocks.selectOrganization).toHaveBeenCalledWith("refresh-token-1", "organization-2");
    await click("sign-out");
    expect(mocks.logout).toHaveBeenCalledWith("selected-access-token");
  });

  it("rejects a structurally valid zero-ACTIVE context through the production guard", async () => {
    const zeroActiveSession = sessionWithZeroActiveMemberships();
    expect(isSessionContext(contextFromSession(zeroActiveSession))).toBe(false);
    mocks.getMe.mockResolvedValue(contextFromSession(zeroActiveSession));
    await renderProvider();

    expect(attribute("data-status")).toBe("anonymous");
  });

  it("keeps registration membership states and rejects a zero-membership result", async () => {
    await renderProvider();
    mocks.register.mockResolvedValue(sessionWithMemberships(2));
    await click("sign-up");
    expect(attribute("data-status")).toBe("selection-required");

    mocks.register.mockRejectedValue(new ApiError("no membership", 401, {
      statusCode: 401,
      code: "NO_ACTIVE_MEMBERSHIP",
      message: "No active membership",
    }));
    await click("sign-up");
    expect(attribute("data-status")).toBe("selection-required");
  });

  it("keeps a no-session public bootstrap quiet", async () => {
    mocks.refresh.mockRejectedValue(new ApiError("unauthorized", 401, {
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    }));
    await renderProvider();
    expect(attribute("data-status")).toBe("anonymous");
    expect(attribute("data-notice")).toBe("");
    expect(mocks.getMe).not.toHaveBeenCalled();
  });

  it("preserves SESSION_REVOKED feedback on protected bootstrap", async () => {
    mocks.pathname = "/dashboard";
    mocks.refresh.mockRejectedValue(new ApiError("revoked", 401, {
      statusCode: 401,
      code: "SESSION_REVOKED",
      message: "Revoked",
    }));
    await renderProvider();
    expect(attribute("data-status")).toBe("anonymous");
    expect(attribute("data-notice")).not.toBe("");
  });

  it("clears state after successful logout and preserves it after logout error", async () => {
    await renderProvider();
    await click("sign-out");
    expect(attribute("data-status")).toBe("anonymous");
    document.body.innerHTML = "";

    mocks.refresh.mockResolvedValue(refreshResponse());
    mocks.getMe.mockResolvedValue(contextFromSession(sessionWithMemberships(1)));
    await renderProvider();
    mocks.logout.mockRejectedValue(new Error("network failure"));
    await click("sign-out");
    expect(attribute("data-status")).toBe("authenticated");
  });
});
