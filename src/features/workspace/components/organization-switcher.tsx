"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuthErrorMessage } from "@/features/auth/auth-error";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { ACTIVE_MEMBERSHIP_STATUS } from "@/features/auth/types/auth";

interface OrganizationSwitcherProps {
  onSuccessfulSelection?: () => void;
}

export function OrganizationSwitcher({
  onSuccessfulSelection,
}: Readonly<OrganizationSwitcherProps>) {
  const router = useRouter();
  const { session, chooseOrganization } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectionInFlightRef = useRef(false);
  const memberships = (session?.memberships ?? []).filter(
    (membership) => membership.status === ACTIVE_MEMBERSHIP_STATUS,
  );
  const activeOrganization = session?.activeOrganization;

  if (!activeOrganization) {
    return null;
  }

  const activeOrganizationId = activeOrganization.id;

  if (memberships.length < 2) {
    return <StaticOrganizationContext organizationName={activeOrganization.name} />;
  }

  async function selectOrganization(organizationId: string) {
    if (organizationId === activeOrganizationId) {
      setError(null);
      setOpen(false);
      return;
    }

    if (selectionInFlightRef.current) {
      return;
    }

    selectionInFlightRef.current = true;
    setPending(true);
    setError(null);

    try {
      await chooseOrganization(organizationId);
      flushSync(() => {
        setOpen(false);
        onSuccessfulSelection?.();
      });
      router.replace("/dashboard");
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError, "selection"));
      setOpen(true);
    } finally {
      selectionInFlightRef.current = false;
      setPending(false);
    }
  }

  return (
    <div className="grid gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex h-11 min-w-0 w-full items-center gap-2 rounded-lg border border-background/15 bg-background/5 px-3 text-left outline-none transition-colors hover:border-background/30 hover:bg-background/10 focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:border-background/30 data-[state=open]:bg-background/10 md:w-44 lg:w-56"
            aria-label={`Cambiar organización. Organización activa: ${activeOrganization.name}`}
            aria-busy={pending}
          >
            <span
              className="material-symbols-outlined shrink-0 text-lg text-background/70"
              aria-hidden="true"
            >
              business
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.625rem] font-medium uppercase tracking-wider text-background/55">
                Organización
              </span>
              <span className="block truncate text-sm font-medium leading-tight">
                {activeOrganization.name}
              </span>
            </span>
            <ChevronDownIcon
              className="size-4 shrink-0 text-background/60 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)] border border-background/20 bg-foreground p-1.5 font-sans text-background"
          align="start"
        >
          {memberships.map((membership) => {
            const isActive = membership.organization.id === activeOrganizationId;

            return (
              <DropdownMenuItem
                key={membership.id}
                disabled={pending}
                aria-current={isActive ? "true" : undefined}
                onSelect={(event) => {
                  event.preventDefault();
                  void selectOrganization(membership.organization.id);
                }}
                className="cursor-pointer px-3 py-2.5 text-background focus:bg-background/15 focus:text-background aria-[current=true]:bg-background/10 aria-[current=true]:font-medium"
              >
                <span className="min-w-0 flex-1 truncate">{membership.organization.name}</span>
                {isActive ? (
                  <span className="flex shrink-0 items-center gap-1.5 text-background/70">
                    <span className="sr-only">Organización activa</span>
                    <CheckIcon className="size-4" aria-hidden="true" />
                  </span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {pending ? (
        <p className="text-xs text-background/70" role="status">
          Cambiando organización...
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StaticOrganizationContext({
  organizationName,
}: Readonly<{ organizationName: string }>) {
  return (
    <div className="flex min-w-0 items-center gap-2 px-1 text-sm">
      <span
        className="material-symbols-outlined shrink-0 text-lg text-background/70"
        aria-hidden="true"
      >
        business
      </span>
      <span className="min-w-0">
        <span className="block text-[0.625rem] font-medium uppercase tracking-wider text-background/55">
          Organización
        </span>
        <span className="block truncate font-medium leading-tight">
          {organizationName}
        </span>
      </span>
    </div>
  );
}
