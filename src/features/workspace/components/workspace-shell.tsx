"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAuthErrorMessage } from "@/features/auth/auth-error";
import { useAuth } from "@/features/auth/hooks/auth-provider";

import { OrganizationSwitcher } from "./organization-switcher";
import { getDisplayName } from "../lib/get-display-name";

export function WorkspaceShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavigationOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileNavigationOpen]);

  if (!session?.activeOrganization || !session.activeMembership) {
    return null;
  }

  const displayName = getDisplayName(session.user);
  const initials = getInitials(displayName);

  async function handleLogout() {
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      await signOut();
      router.replace("/auth/login");
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError, "logout"));
      setPending(false);
    }
  }

  return (
    <div className="min-h-svh bg-foreground font-sans text-background">
      <header className="border-b border-background/20 bg-foreground">
        <div className="flex min-h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-background md:hidden"
              aria-expanded={mobileNavigationOpen}
              aria-controls="workspace-mobile-navigation"
              aria-label={
                mobileNavigationOpen
                  ? "Cerrar navegación"
                  : "Abrir navegación"
              }
              onClick={() => setMobileNavigationOpen((isOpen) => !isOpen)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {mobileNavigationOpen ? "close" : "menu"}
              </span>
            </Button>
            <p className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              LegacyLift
            </p>
          </div>

          <div className="flex min-w-0 items-center gap-4">
            <div className="hidden min-w-0 items-center gap-3 md:flex lg:gap-5">
              <OrganizationSwitcher />
              <Separator orientation="vertical" className="h-7 bg-background/20" />
              <div className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  account_circle
                </span>
                <span className="hidden max-w-40 truncate lg:inline">{displayName}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-background"
                aria-label="Cerrar sesión"
                onClick={() => void handleLogout()}
                disabled={pending}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  logout
                </span>
              </Button>
            </div>

            <div
              className="flex size-10 items-center justify-center rounded-full border border-background/20 bg-background/10 text-sm font-semibold md:hidden"
              aria-label={`Usuario: ${displayName}`}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {mobileNavigationOpen ? (
        <>
          <button
            type="button"
            aria-label="Cerrar navegación"
            className="fixed inset-0 z-40 bg-foreground/70 md:hidden"
            onClick={() => setMobileNavigationOpen(false)}
          />
          <aside
            id="workspace-mobile-navigation"
            aria-label="Navegación móvil del workspace"
            className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[86vw] flex-col border-r border-background/20 bg-foreground md:hidden"
          >
            <div className="flex h-18 shrink-0 items-center justify-between gap-3 border-b border-background/20 px-3">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Cerrar navegación"
                onClick={() => setMobileNavigationOpen(false)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </Button>
              <p className="min-w-0 flex-1 truncate text-xl font-semibold tracking-tight">
                LegacyLift
              </p>
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-background/20 bg-background/10 text-sm font-semibold"
                aria-label={`Usuario: ${displayName}`}
              >
                {initials}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="border-b border-background/20 p-4">
                <OrganizationSwitcher
                  onSuccessfulSelection={() => setMobileNavigationOpen(false)}
                />
              </div>
              <WorkspaceNavigation
                session={session}
                onNavigate={() => setMobileNavigationOpen(false)}
              />
            </div>

            <div className="shrink-0 border-t border-background/20 p-3">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start text-background"
                onClick={() => void handleLogout()}
                disabled={pending}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  logout
                </span>
                {pending ? "Cerrando sesión..." : "Cerrar sesión"}
              </Button>
            </div>
          </aside>
        </>
      ) : null}

      <div className="flex min-h-[calc(100svh-4.5rem)]">
        <aside className="hidden w-72 shrink-0 border-r border-background/20 md:flex md:flex-col">
          <WorkspaceNavigation session={session} />
        </aside>

        <main id="workspace-main" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            {error ? (
              <p
                className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </p>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const primaryNavigationItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard", enabled: true },
  { label: "Proyectos", icon: "folder", enabled: false },
  { label: "Sistemas", icon: "account_tree", enabled: false },
  { label: "Análisis", icon: "analytics", enabled: false },
  { label: "Modernización", icon: "auto_fix_high", enabled: false },
] as const;

const supportNavigationItems = [
  { label: "Soporte", icon: "help" },
  { label: "Documentación", icon: "description" },
] as const;

function WorkspaceNavigation({
  session,
  onNavigate,
}: Readonly<{
  session: NonNullable<ReturnType<typeof useAuth>["session"]>;
  onNavigate?: () => void;
}>) {
  const pathname = usePathname();
  const canReadMembers = session.activeMembership.permissions.includes("members.read");
  const secondaryItems = canReadMembers
    ? [{ label: "Roles & permisos", icon: "admin_panel_settings", href: "/settings/roles" }]
    : [];

  return (
    <nav
      aria-label="Navegación del workspace"
      className="flex min-h-full flex-col gap-8 p-3"
    >
      <ul className="grid gap-1">
        {primaryNavigationItems.map((item) => (
          <li key={item.label}>
            {item.enabled && item.href ? (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-background outline-none transition hover:bg-background/15 focus-visible:ring-3 focus-visible:ring-ring/50 ${
                  pathname === item.href
                    ? "border-l-2 border-primary bg-background/10"
                    : "border-l-2 border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="flex items-center gap-3 px-4 py-3 text-sm text-background/55"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>

      {secondaryItems.length > 0 ? (
        <ul className="grid gap-1 border-t border-background/20 pt-4">
          <li className="px-4 pt-1 pb-2 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-background/55">
            Settings
          </li>
          {secondaryItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-background outline-none transition hover:bg-background/15 focus-visible:ring-3 focus-visible:ring-ring/50 ${
                  pathname === item.href
                    ? "border-l-2 border-primary bg-background/10"
                    : "border-l-2 border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="mt-auto grid gap-1 border-t border-background/20 pt-4">
        {supportNavigationItems.map((item) => (
          <li key={item.label}>
            <span
              aria-disabled="true"
              className="flex items-center gap-3 px-4 py-3 text-sm text-background/55"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
