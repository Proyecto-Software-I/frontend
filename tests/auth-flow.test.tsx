import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { contextFromSession, preSelectionSessionWithMultipleMemberships, refreshResponse, selectedSessionWithMultipleMemberships, sessionWithMemberships } from "./auth-fixtures";

const mocks = vi.hoisted(() => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  pathname: "/auth/login",
  refresh: vi.fn(),
  register: vi.fn(),
  replace: vi.fn(),
  selectOrganization: vi.fn(),
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
  useRouter: () => ({ replace: mocks.replace }),
}));

import { LoginForm } from "@/features/auth/components/login-form";
import { OrganizationSelector } from "@/features/auth/components/organization-selector";
import { RegisterForm } from "@/features/auth/components/register-form";
import { SessionBoundary } from "@/features/auth/components/session-boundary";
import { AuthProvider, resetAuthMemoryForTests } from "@/features/auth/hooks/auth-provider";
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";

describe("Auth journey", () => {
  beforeEach(() => {
    resetAuthMemoryForTests();
    mocks.pathname = "/auth/login";
    mocks.replace.mockReset();
    mocks.getMe.mockReset();
    mocks.login.mockReset();
    mocks.logout.mockReset();
    mocks.refresh.mockReset();
    mocks.register.mockReset();
    mocks.selectOrganization.mockReset();
    mocks.refresh.mockRejectedValue(unauthorized());
    mocks.logout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    resetAuthMemoryForTests();
  });

  it("sends a one-organization login to the dashboard without rendering the selector", async () => {
    mocks.login.mockResolvedValue(sessionWithMemberships(1, false));
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    await screen.findByText("Iniciar sesión");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "password");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.login).toHaveBeenCalledWith({ email: "user@example.com", password: "password" });
    expect(screen.queryByText("Elegí una organización")).not.toBeInTheDocument();
  });

  it("sends a multi-organization login to organization selection", async () => {
    mocks.login.mockResolvedValue(preSelectionSessionWithMultipleMemberships());
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    await screen.findByText("Iniciar sesión");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "password");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/auth/select-organization"));
  });

  it("disables login controls while the request is pending", async () => {
    const pending = deferred<ReturnType<typeof sessionWithMemberships>>();
    mocks.login.mockReturnValue(pending.promise);
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    await screen.findByText("Iniciar sesión");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "password");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByRole("button", { name: "Ingresando..." })).toBeDisabled();
    pending.resolve(sessionWithMemberships(1, false));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows the safe invalid-credentials message and allows a retry", async () => {
    mocks.login.mockRejectedValue(new ApiError("invalid", 401, {
      code: "INVALID_CREDENTIALS",
      message: "Invalid credentials",
      statusCode: 401,
    }));
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    await screen.findByText("Iniciar sesión");
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "password");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El email o la contraseña no son válidos.",
    );
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeEnabled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("registers the agreed input and routes an active organization to the dashboard", async () => {
    mocks.register.mockResolvedValue(sessionWithMemberships(1, false));
    const user = userEvent.setup();
    mocks.pathname = "/auth/register";
    renderAuth(<RegisterForm />);

    await screen.findByRole("button", { name: "Crear cuenta" });
    await user.type(screen.getByLabelText("Nombre"), "Ada");
    await user.type(screen.getByLabelText("Apellido"), "Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "password1");
    await user.type(screen.getByLabelText("Nombre de la organización"), "Analytical Engines");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.register).toHaveBeenCalledWith({
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      organizationName: "Analytical Engines",
      password: "password1",
    });
    expect(screen.queryByText("Elegí una organización")).not.toBeInTheDocument();
  });

  it("selects an active organization once and routes to the dashboard", async () => {
    mocks.pathname = "/auth/select-organization";
    mocks.refresh.mockResolvedValue(refreshResponse());
    mocks.getMe.mockResolvedValue(contextFromSession(preSelectionSessionWithMultipleMemberships()));
    const pending = deferred<ReturnType<typeof selectedSessionWithMultipleMemberships>>();
    mocks.selectOrganization.mockReturnValue(pending.promise);
    const user = userEvent.setup();
    renderAuth(<OrganizationSelector />);

    await screen.findByText("Elegí una organización");
    expect(screen.getByRole("radio", { name: /Organization 123/i })).toBeEnabled();
    expect(screen.getByRole("radio", { name: /Organization 321/i })).toBeEnabled();
    await user.click(screen.getByRole("radio", { name: /Organization 123/i }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(mocks.selectOrganization).toHaveBeenCalledWith("refresh-token-1", "org123");
    expect(screen.getByRole("button", { name: "Seleccionando..." })).toBeDisabled();
    pending.resolve(selectedSessionWithMultipleMemberships());
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.selectOrganization).toHaveBeenCalledOnce();
  });

  it("restores a protected session before rendering private content", async () => {
    mocks.pathname = "/dashboard";
    mocks.refresh.mockResolvedValue(refreshResponse());
    mocks.getMe.mockResolvedValue(contextFromSession(sessionWithMemberships(1, false)));
    renderAuth(<p>Contenido privado</p>);

    expect(screen.getByRole("status")).toHaveTextContent("Restaurando sesión...");
    expect(await screen.findByText("Contenido privado")).toBeVisible();
    expect(mocks.getMe).toHaveBeenCalledWith("refresh-token-1");
  });

  it("redirects an anonymous protected session to login without rendering private content", async () => {
    mocks.pathname = "/dashboard";
    renderAuth(<p>Contenido privado</p>);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/auth/login"));
    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
  });

  it("clears the workspace session, blocks duplicate logout, and routes to login", async () => {
    mocks.pathname = "/dashboard";
    mocks.refresh.mockResolvedValue(refreshResponse());
    mocks.getMe.mockResolvedValue(contextFromSession(sessionWithMemberships(1, false)));
    const pending = deferred<void>();
    mocks.logout.mockReturnValue(pending.promise);
    const user = userEvent.setup();
    renderAuth(<WorkspaceShell><p>Contenido privado</p></WorkspaceShell>);

    await screen.findByText("Contenido privado");
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeDisabled();
    pending.resolve();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/auth/login"));
    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
    expect(mocks.logout).toHaveBeenCalledWith("refresh-token-1");
  });
});

function renderAuth(children: ReactNode) {
  return render(
    <AuthProvider>
      <SessionBoundary>{children}</SessionBoundary>
    </AuthProvider>,
  );
}

function unauthorized() {
  return new ApiError("unauthorized", 401, {
    code: "UNAUTHORIZED",
    message: "Unauthorized",
    statusCode: 401,
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}
