import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pathname: "/auth/login",
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
  status: "anonymous" as "anonymous" | "authenticated" | "selection-required" | "bootstrapping" | "error",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/features/auth/hooks/auth-provider", () => ({
  useAuth: () => ({ notice: null, status: mocks.status }),
}));

import { SessionBoundary } from "@/features/auth/components/session-boundary";

const mountedRoots: Root[] = [];

describe("SessionBoundary invitation return", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.pathname = "/auth/login";
    mocks.replace.mockReset();
    mocks.searchParams = new URLSearchParams();
    mocks.status = "anonymous";
  });

  afterEach(async () => {
    await act(async () => {
      while (mountedRoots.length > 0) {
        mountedRoots.pop()?.unmount();
      }
    });
    document.body.innerHTML = "";
  });

  it("returns authenticated users from login to a valid invitation returnTo", async () => {
    mocks.status = "authenticated";
    mocks.searchParams = new URLSearchParams({ returnTo: "/invite/abc123" });

    await renderBoundary();

    expect(mocks.replace).toHaveBeenCalledWith("/invite/abc123");
  });

  it("preserves a valid invitation returnTo for selection-required sessions", async () => {
    mocks.status = "selection-required";
    mocks.searchParams = new URLSearchParams({ returnTo: "/invite/abc123" });

    await renderBoundary();

    expect(mocks.replace).toHaveBeenCalledWith("/invite/abc123");
  });

  it("rejects unsafe login returnTo values", async () => {
    mocks.status = "authenticated";

    for (const returnTo of ["https://evil.example", "//evil.example", "/settings/members"]) {
      mocks.replace.mockReset();
      mocks.searchParams = new URLSearchParams({ returnTo });
      await renderBoundary();
      expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
    }
  });
});

async function renderBoundary(): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  await act(async () => {
    root.render(<SessionBoundary><p>content</p></SessionBoundary>);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
