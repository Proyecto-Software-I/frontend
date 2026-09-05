"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { ApiError } from "@/lib/api/api-error";

import {
  getMe,
  login,
  logout,
  refresh,
  register,
  selectOrganization,
  type LoginInput,
  type RegisterInput,
} from "../api/auth-api";
import { getAuthErrorMessage } from "../auth-error";
import {
  isSessionContext,
  type AuthStatus,
  type FullSession,
  type SessionContext,
} from "../types/auth";

interface AuthState {
  status: AuthStatus;
  session: SessionContext | null;
  notice: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  chooseOrganization: (organizationId: string) => Promise<void>;
  getAccessToken: () => string | null;
  hasPermission: (permission: string) => boolean;
  reloadSession: () => Promise<SessionContext>;
  signOut: () => Promise<void>;
  clearNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const protectedPaths = new Set([
  "/dashboard",
  "/settings/members",
  "/auth/select-organization",
]);
const initialState: AuthState = {
  status: "bootstrapping",
  session: null,
  notice: null,
};

let authMemory = {
  accessToken: null as string | null,
  state: initialState,
  generation: 0,
  bootstrapSettled: false,
};
let bootstrapFlight: Promise<{ accessToken: string; session: SessionContext }> | null = null;
let bootstrapGeneration = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publish(state: AuthState, accessToken: string | null) {
  authMemory = { ...authMemory, state, accessToken };
  listeners.forEach((listener) => listener());
}

function beginOperation() {
  authMemory.generation += 1;
  authMemory.bootstrapSettled = true;
  return authMemory.generation;
}

function adoptFullSession(operation: number, fullSession: FullSession) {
  if (authMemory.generation !== operation) return;
  publish(
    {
      status: sessionStatus(fullSession),
      session: contextFromFullSession(fullSession),
      notice: null,
    },
    fullSession.auth.accessToken,
  );
}

function startBootstrap() {
  if (authMemory.accessToken || authMemory.bootstrapSettled) return null;
  if (bootstrapFlight) return bootstrapFlight;

  bootstrapGeneration = authMemory.generation;
  const flight = (async () => {
    const refreshed = await refresh();
    if (authMemory.generation !== bootstrapGeneration) {
      throw new Error("Bootstrap superseded by a newer authentication operation.");
    }
    const session = await getMe(refreshed.auth.accessToken);
    if (!isSessionContext(session)) {
      throw new Error("El backend devolvió una respuesta de autenticación inesperada.");
    }
    return { accessToken: refreshed.auth.accessToken, session };
  })();
  bootstrapFlight = flight;
  void flight.finally(() => {
    if (bootstrapFlight === flight) bootstrapFlight = null;
  }).catch(() => undefined);
  return flight;
}

function sessionStatus(session: SessionContext): AuthStatus {
  return session.requiresOrganizationSelection
    ? "selection-required"
    : "authenticated";
}

function contextFromFullSession(fullSession: FullSession): SessionContext {
  return {
    user: fullSession.user,
    activeOrganization: fullSession.activeOrganization,
    activeMembership: fullSession.activeMembership,
    memberships: fullSession.memberships,
    requiresOrganizationSelection: fullSession.requiresOrganizationSelection,
  };
}

function isAnonymousBootstrapFailure(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 401) {
    return false;
  }

  return ["SESSION_EXPIRED", "SESSION_REVOKED", "UNAUTHORIZED"].includes(
    error.code ?? "",
  );
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const initialPathnameRef = useRef(pathname);
  const state = useSyncExternalStore(subscribe, () => authMemory.state, () => initialState);

  useEffect(() => {
    let cancelled = false;
    const flight = startBootstrap();
    const generation = bootstrapGeneration;
    if (flight) {
      void flight.then(
        ({ accessToken, session }) => {
          if (cancelled || authMemory.generation !== generation || authMemory.bootstrapSettled) return;
          authMemory.bootstrapSettled = true;
          publish({ status: sessionStatus(session), session, notice: null }, accessToken);
        },
        (error: unknown) => {
          if (cancelled || authMemory.generation !== generation || authMemory.bootstrapSettled) return;
          authMemory.bootstrapSettled = true;
          const anonymous = isAnonymousBootstrapFailure(error);
          const notice =
            anonymous &&
            protectedPaths.has(initialPathnameRef.current) &&
            error instanceof ApiError &&
            (error.code === "SESSION_EXPIRED" ||
              error.code === "SESSION_REVOKED")
              ? getAuthErrorMessage(error, "session")
              : anonymous
                ? null
                : getAuthErrorMessage(error, "session");
          publish({ status: anonymous ? "anonymous" : "error", session: null, notice }, null);
        },
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(input: LoginInput): Promise<void> {
    const operation = beginOperation();
    const fullSession = await login(input);
    adoptFullSession(operation, fullSession);
  }

  async function signUp(input: RegisterInput): Promise<void> {
    const operation = beginOperation();
    const fullSession = await register(input);
    adoptFullSession(operation, fullSession);
  }

  async function chooseOrganization(organizationId: string): Promise<void> {
    const accessToken = authMemory.accessToken;
    if (!accessToken) {
      throw new Error("La sesión ya no está disponible.");
    }

    const operation = beginOperation();
    const fullSession = await selectOrganization(accessToken, organizationId);
    adoptFullSession(operation, fullSession);
  }

  async function reloadSession(): Promise<SessionContext> {
    const accessToken = authMemory.accessToken;
    if (!accessToken) {
      throw new Error("La sesión ya no está disponible.");
    }

    const operation = beginOperation();
    const session = await getMe(accessToken);
    if (authMemory.generation === operation) {
      publish(
        { status: sessionStatus(session), session, notice: null },
        accessToken,
      );
    }
    return session;
  }

  async function signOut(): Promise<void> {
    const accessToken = authMemory.accessToken;
    const operation = beginOperation();
    if (!accessToken) {
      if (authMemory.generation === operation) {
        publish({ status: "anonymous", session: null, notice: null }, null);
      }
      return;
    }

    await logout(accessToken);
    if (authMemory.generation === operation) {
      publish({ status: "anonymous", session: null, notice: null }, null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        chooseOrganization,
        getAccessToken: () => authMemory.accessToken,
        hasPermission: (permission: string) =>
          state.session?.activeMembership?.permissions.includes(permission) ?? false,
        reloadSession,
        signOut,
        clearNotice: () => publish({ ...authMemory.state, notice: null }, authMemory.accessToken),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function resetAuthMemoryForTests() {
  authMemory = {
    accessToken: null,
    state: initialState,
    generation: 0,
    bootstrapSettled: false,
  };
  bootstrapFlight = null;
  bootstrapGeneration = 0;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
