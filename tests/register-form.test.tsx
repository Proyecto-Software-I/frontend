import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RegisterInput } from "@/features/auth/api/auth-api";

const mocks = vi.hoisted(() => ({
  clearNotice: vi.fn(),
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

import { RegisterForm } from "@/features/auth/components/register-form";

const mountedRoots: Root[] = [];

describe("RegisterForm", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mocks.clearNotice.mockReset();
    mocks.replace.mockReset();
    mocks.signUp.mockReset();
    mocks.signUp.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await act(async () => {
      while (mountedRoots.length > 0) {
        mountedRoots.pop()?.unmount();
      }
    });
    document.body.innerHTML = "";
  });

  it("keeps normal registration fields and submits the normal payload", async () => {
    await renderRegisterForm();

    expect(input("organizationName")).not.toBeNull();
    await change("firstName", "Normal");
    await change("lastName", "User");
    await change("email", "normal@example.com");
    await change("password", "password");
    await change("organizationName", "Normal Org");
    await submit();

    expect(mocks.signUp).toHaveBeenCalledWith({
      firstName: "Normal",
      lastName: "User",
      email: "normal@example.com",
      password: "password",
      organizationName: "Normal Org",
    });
    expect(mocks.signUp.mock.calls[0]?.[0]).not.toHaveProperty("invitationToken");
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("renders invitation mode with read-only email and no organizationName field", async () => {
    await renderRegisterForm({
      invitationToken: "invite-token-123",
      email: "member@example.com",
      organizationName: "Inviting Org",
    });

    expect(document.body.textContent).toContain("Has sido invitado a Inviting Org.");
    expect(input("organizationName")).toBeNull();
    expect(input("email")?.value).toBe("member@example.com");
    expect(input("email")?.readOnly).toBe(true);
  });

  it("submits invitation registration without email or organizationName and goes to dashboard", async () => {
    await renderRegisterForm({
      invitationToken: "invite-token-123",
      email: "member@example.com",
      organizationName: "Inviting Org",
    });

    await change("firstName", "Invited");
    await change("lastName", "User");
    await change("password", "password");
    input("email")?.dispatchEvent(new Event("input", { bubbles: true }));
    await submit();

    expect(mocks.signUp).toHaveBeenCalledWith({
      firstName: "Invited",
      lastName: "User",
      password: "password",
      invitationToken: "invite-token-123",
    });
    expect(mocks.signUp.mock.calls[0]?.[0]).not.toHaveProperty("email");
    expect(mocks.signUp.mock.calls[0]?.[0]).not.toHaveProperty("organizationName");
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
  });
});

async function renderRegisterForm(invitation?: {
  invitationToken: string;
  email: string;
  organizationName: string;
}): Promise<void> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  await act(async () => {
    root.render(<RegisterForm invitation={invitation} />);
  });
}

function input(name: string): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
}

async function change(name: string, value: string): Promise<void> {
  const field = input(name);
  if (!field) throw new Error(`Missing ${name} field`);
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  await act(async () => {
    valueSetter?.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function submit(): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!button) throw new Error("Missing submit button");
  await act(async () => {
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
