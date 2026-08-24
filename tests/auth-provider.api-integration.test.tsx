import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { preSelectionSessionWithMultipleMemberships, selectedSessionWithMultipleMemberships } from "./auth-fixtures";

vi.mock("next/navigation", () => ({ usePathname: () => "/auth/select-organization" }));

import { AuthProvider, resetAuthMemoryForTests, useAuth } from "@/features/auth/hooks/auth-provider";

const fetchMock = vi.fn<typeof fetch>();
let root: ReturnType<typeof createRoot> | undefined;

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function Probe() {
  const auth = useAuth();
  return (
    <div
      data-status={auth.status}
      data-organization={auth.session?.activeOrganization?.id ?? ""}
      data-memberships={auth.session?.memberships.length ?? 0}
      data-roles={auth.session?.activeMembership?.roles.join(",") ?? ""}
    >
      <button onClick={() => void auth.chooseOrganization("org321")}>choose</button>
      <button onClick={() => void auth.signOut()}>logout</button>
    </div>
  );
}

describe("AuthProvider with the production auth API", () => {
  beforeEach(() => {
    resetAuthMemoryForTests();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    const pending = preSelectionSessionWithMultipleMemberships();
    fetchMock
      .mockResolvedValueOnce(response({ auth: { accessToken: "pending-token", tokenType: "Bearer", expiresIn: 900 } }))
      .mockResolvedValueOnce(response({ ...pending, auth: undefined }))
      .mockResolvedValueOnce(response(selectedSessionWithMultipleMemberships()))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("validates and atomically adopts a selected multi-membership session", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root?.render(<AuthProvider><Probe /></AuthProvider>);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const probe = container.querySelector("div");
    expect(probe?.dataset.status).toBe("selection-required");
    await act(async () => {
      container.querySelector("button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(probe?.dataset).toMatchObject({
      status: "authenticated",
      organization: "org321",
      memberships: "2",
      roles: "",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3,
      "http://localhost:3000/api/auth/select-organization",
      expect.objectContaining({
        body: JSON.stringify({ organizationId: "org321" }),
        headers: expect.objectContaining({ Authorization: "Bearer pending-token" }),
      }),
    );
    await act(async () => {
      container.querySelectorAll("button")[1]?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(fetchMock).toHaveBeenNthCalledWith(4,
      "http://localhost:3000/api/auth/logout",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({ Authorization: "Bearer selected-access-token" }),
      }),
    );
    expect(probe?.dataset.status).toBe("anonymous");
  });
});
