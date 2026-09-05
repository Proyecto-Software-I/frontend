"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/features/auth/hooks/auth-provider";

import {
  listOrganizationInvitations,
  listOrganizationMembers,
} from "../api/organization-members-api";
import { getOrganizationErrorMessage } from "../lib/organization-errors";
import type {
  OrganizationInvitation,
  OrganizationMember,
} from "../types/organizations";

type ReadStatus = "idle" | "loading" | "success" | "error";

interface CollectionState<T> {
  status: ReadStatus;
  data: T[];
  error: string | null;
  tenantKey: string | null;
}

interface UseOrganizationMembersReadStateResult {
  canReadMembers: boolean;
  canManageMembers: boolean;
  tenantKey: string | null;
  members: CollectionState<OrganizationMember>;
  invitations: CollectionState<OrganizationInvitation>;
  visibleMembers: OrganizationMember[];
  pendingInvitations: OrganizationInvitation[];
  retryMembers: () => void;
  retryInvitations: () => void;
}

const idleMembers: CollectionState<OrganizationMember> = {
  status: "idle",
  data: [],
  error: null,
  tenantKey: null,
};

const idleInvitations: CollectionState<OrganizationInvitation> = {
  status: "idle",
  data: [],
  error: null,
  tenantKey: null,
};

export function useOrganizationMembersReadState(): UseOrganizationMembersReadStateResult {
  const { getAccessToken, hasPermission, session } = useAuth();
  const canReadMembers = hasPermission("members.read");
  const canManageMembers = hasPermission("members.manage");
  const tenantKey = session?.activeOrganization?.id ?? null;
  const [members, setMembers] = useState<CollectionState<OrganizationMember>>(idleMembers);
  const [invitations, setInvitations] =
    useState<CollectionState<OrganizationInvitation>>(idleInvitations);
  const membersRequestRef = useRef(0);
  const invitationsRequestRef = useRef(0);

  const loadMembers = useCallback(() => {
    const accessToken = getAccessToken();
    const request = membersRequestRef.current + 1;
    membersRequestRef.current = request;

    if (!canReadMembers || !tenantKey || !accessToken) {
      setMembers(idleMembers);
      return;
    }

    setMembers({ status: "loading", data: [], error: null, tenantKey });
    void listOrganizationMembers(accessToken).then(
      (data) => {
        if (membersRequestRef.current !== request) return;
        setMembers({ status: "success", data, error: null, tenantKey });
      },
      (error: unknown) => {
        if (membersRequestRef.current !== request) return;
        setMembers({
          status: "error",
          data: [],
          error: getOrganizationErrorMessage(error),
          tenantKey,
        });
      },
    );
  }, [canReadMembers, getAccessToken, tenantKey]);

  const loadInvitations = useCallback(() => {
    const accessToken = getAccessToken();
    const request = invitationsRequestRef.current + 1;
    invitationsRequestRef.current = request;

    if (!canReadMembers || !tenantKey || !accessToken) {
      setInvitations(idleInvitations);
      return;
    }

    setInvitations({ status: "loading", data: [], error: null, tenantKey });
    void listOrganizationInvitations(accessToken).then(
      (data) => {
        if (invitationsRequestRef.current !== request) return;
        setInvitations({ status: "success", data, error: null, tenantKey });
      },
      (error: unknown) => {
        if (invitationsRequestRef.current !== request) return;
        setInvitations({
          status: "error",
          data: [],
          error: getOrganizationErrorMessage(error),
          tenantKey,
        });
      },
    );
  }, [canReadMembers, getAccessToken, tenantKey]);

  useEffect(() => {
    let cancelled = false;
    membersRequestRef.current += 1;
    invitationsRequestRef.current += 1;

    if (canReadMembers && tenantKey) {
      void Promise.resolve().then(() => {
        if (cancelled) return;
        loadMembers();
        loadInvitations();
      });
    }

    return () => {
      cancelled = true;
    };
  }, [canReadMembers, loadInvitations, loadMembers, tenantKey]);

  const currentMembers = members.tenantKey === tenantKey ? members : idleMembers;
  const currentInvitations =
    invitations.tenantKey === tenantKey ? invitations : idleInvitations;
  const visibleMembers = useMemo(
    () => currentMembers.data.filter((member) => member.status !== "REMOVED"),
    [currentMembers.data],
  );
  const pendingInvitations = useMemo(
    () => currentInvitations.data.filter((invitation) => invitation.status === "PENDING"),
    [currentInvitations.data],
  );

  return {
    canReadMembers,
    canManageMembers,
    tenantKey,
    members: currentMembers,
    invitations: currentInvitations,
    visibleMembers,
    pendingInvitations,
    retryMembers: loadMembers,
    retryInvitations: loadInvitations,
  };
}
