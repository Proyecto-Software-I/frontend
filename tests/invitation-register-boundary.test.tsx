import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RegisterInput } from "@/features/auth/api/auth-api";

const mocks = vi.hoisted(() => ({
  clearNotice: vi.fn(),
  getInvitationPreview: vi.fn(),
  replace: vi.fn(),
  signUp: vi.fn<(input: RegisterInput) => Promise<void>>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/features/auth/hooks/auth-provider", () => ({
  useAuth: () => ({
    clearNotice: mocks.clearNotice,
    notice: null,
    signUp: mocks.signUp,
  }),
}));

vi.mock("@/features/organizations/api/organization-members-api", () => ({
  getInvitationPreview: mocks.getInvitationPreview,
}));

import { InvitationRegisterBoundary } from "@/features/auth/components/invitation-register-boundary";

const roots: Root[] = [];

describe("InvitationRegisterBoundary", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.clearNotice.mockReset();
    mocks.getInvitationPreview.mockReset();
    mocks.replace.mockReset();
    mocks.signUp.mockReset();
    mocks.signUp.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await act(async () => {
      while (roots.length > 0) roots.pop()?.unmount();
    });
    document.body.innerHTML = "";
  });

  it("uses validated preview metadata for invitation registration and preserves the exact payload", async () => {
    mocks.getInvitationPreview.mockResolvedValueOnce({
      email: "trusted@example.com",
      organization: { name: "Trusted Organization", slug: "trusted-org" },
      expiresAt: "2026-01-10T00:00:00.000Z",
    });
    await render();
    await flush();

    expect(mocks.getInvitationPreview).toHaveBeenCalledWith("invite-token");
    expect(document.body.textContent).toContain("You've been invited to Trusted Organization.");
    expect(input("email")?.value).toBe("trusted@example.com");
    expect(input("email")?.readOnly).toBe(true);
    expect(input("organizationName")).toBeNull();

    await change("firstName", "Invited");
    await change("lastName", "User");
    await change("password", "password");
    await submit();

    expect(mocks.signUp).toHaveBeenCalledWith({
      firstName: "Invited",
      lastName: "User",
      password: "password",
      invitationToken: "invite-token",
    });
    expect(mocks.signUp.mock.calls[0]?.[0]).not.toHaveProperty("email");
    expect(mocks.signUp.mock.calls[0]?.[0]).not.toHaveProperty("organizationName");
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
  });
});

async function render(): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(<InvitationRegisterBoundary token="invite-token" />);
  });
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function input(name: string): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
}

async function change(name: string, value: string): Promise<void> {
  const field = input(name);
  if (!field) throw new Error(`Missing ${name}`);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  await act(async () => {
    setter?.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function submit(): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!button) throw new Error("Missing submit button");
  await act(async () => {
    button.click();
    await Promise.resolve();
  });
}
