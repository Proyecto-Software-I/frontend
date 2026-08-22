"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
import type { AuthStatus, FullSession, SessionContext } from "../types/auth";

interface AuthState {
  status: AuthStatus;
  session: SessionContext | null;
  notice: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  chooseOrganization: (organizationId: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const accessTokenRef = useRef<string | null>(null);
  const [state, setState] = useState<AuthState>({
    status: "bootstrapping",
    session: null,
    notice: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const refreshed = await refresh();
        const session = await getMe(refreshed.auth.accessToken);

        if (cancelled) {
          return;
        }

        accessTokenRef.current = refreshed.auth.accessToken;
        setState({
          status: sessionStatus(session),
          session,
          notice: null,
        });
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        accessTokenRef.current = null;
        setState({
          status: "anonymous",
          session: null,
          notice:
            error instanceof ApiError &&
            (error.code === "SESSION_EXPIRED" ||
              error.code === "SESSION_REVOKED")
              ? getAuthErrorMessage(error, "session")
              : null,
        });
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(input: LoginInput): Promise<void> {
    const fullSession = await login(input);
    accessTokenRef.current = fullSession.auth.accessToken;
    setState({
      status: sessionStatus(fullSession),
      session: contextFromFullSession(fullSession),
      notice: null,
    });
  }

  async function signUp(input: RegisterInput): Promise<void> {
    const fullSession = await register(input);
    accessTokenRef.current = fullSession.auth.accessToken;
    setState({
      status: sessionStatus(fullSession),
      session: contextFromFullSession(fullSession),
      notice: null,
    });
  }

  async function chooseOrganization(organizationId: string): Promise<void> {
    const accessToken = accessTokenRef.current;
    if (!accessToken) {
      throw new Error("La sesión ya no está disponible.");
    }

    const fullSession = await selectOrganization(accessToken, organizationId);
    accessTokenRef.current = fullSession.auth.accessToken;
    setState({
      status: sessionStatus(fullSession),
      session: contextFromFullSession(fullSession),
      notice: null,
    });
  }

  async function signOut(): Promise<void> {
    const accessToken = accessTokenRef.current;
    if (!accessToken) {
      setState({ status: "anonymous", session: null, notice: null });
      return;
    }

    await logout(accessToken);
    accessTokenRef.current = null;
    setState({ status: "anonymous", session: null, notice: null });
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        chooseOrganization,
        signOut,
        clearNotice: () =>
          setState((current) => ({ ...current, notice: null })),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
