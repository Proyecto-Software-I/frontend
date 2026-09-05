"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/features/auth/hooks/auth-provider";

import {
  createOrganizationInvitation,
  listOrganizationInvitations,
  listOrganizationMembers,
  reactivateOrganizationMember,
  removeOrganizationMember,
  revokeOrganizationInvitation,
  suspendOrganizationMember,
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
  activeOrganizationName: string | null;
  createInvitation: {
    pending: boolean;
    error: string | null;
    acceptanceUrl: string | null;
    submit: (email: string) => Promise<boolean>;
    clear: () => void;
  };
  revokeInvitation: {
    pendingId: string | null;
    error: string | null;
    submit: (invitationId: string) => Promise<boolean>;
    clearError: () => void;
  };
  memberMutation: {
    pendingId: string | null;
    error: string | null;
    suspend: (membershipId: string) => Promise<boolean>;
    reactivate: (membershipId: string) => Promise<boolean>;
    remove: (membershipId: string) => Promise<boolean>;
    clearError: () => void;
  };
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
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [acceptanceUrl, setAcceptanceUrl] = useState<string | null>(null);
  const [revokePendingId, setRevokePendingId] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [memberPendingId, setMemberPendingId] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);
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

  const refetchInvitations = useCallback(async () => {
    const accessToken = getAccessToken();
    const request = invitationsRequestRef.current + 1;
    invitationsRequestRef.current = request;

    if (!canReadMembers || !tenantKey || !accessToken) {
      setInvitations(idleInvitations);
      return false;
    }

    setInvitations({ status: "loading", data: [], error: null, tenantKey });

    try {
      const data = await listOrganizationInvitations(accessToken);
      if (invitationsRequestRef.current !== request) return false;
      setInvitations({ status: "success", data, error: null, tenantKey });
      return true;
    } catch (error: unknown) {
      if (invitationsRequestRef.current !== request) return false;
      setInvitations({
        status: "error",
        data: [],
        error: getOrganizationErrorMessage(error),
        tenantKey,
      });
      return false;
    }
  }, [canReadMembers, getAccessToken, tenantKey]);

  const refetchMembers = useCallback(async () => {
    const accessToken = getAccessToken();
    const request = membersRequestRef.current + 1;
    membersRequestRef.current = request;

    if (!canReadMembers || !tenantKey || !accessToken) {
      setMembers(idleMembers);
      return false;
    }

    setMembers({ status: "loading", data: [], error: null, tenantKey });

    try {
      const data = await listOrganizationMembers(accessToken);
      if (membersRequestRef.current !== request) return false;
      setMembers({ status: "success", data, error: null, tenantKey });
      return true;
    } catch (error: unknown) {
      if (membersRequestRef.current !== request) return false;
      setMembers({
        status: "error",
        data: [],
        error: getOrganizationErrorMessage(error),
        tenantKey,
      });
      return false;
    }
  }, [canReadMembers, getAccessToken, tenantKey]);

  const submitCreateInvitation = useCallback(async (email: string) => {
    const accessToken = getAccessToken();
    if (!canManageMembers || !tenantKey || !accessToken || createPending) return false;

    setCreatePending(true);
    setCreateError(null);
    setAcceptanceUrl(null);

    try {
      const created = await createOrganizationInvitation(accessToken, { email });
      const reloaded = await refetchInvitations();
      if (reloaded) {
        setAcceptanceUrl(created.acceptanceUrl);
      }
      return reloaded;
    } catch (error: unknown) {
      setCreateError(getOrganizationErrorMessage(error));
      return false;
    } finally {
      setCreatePending(false);
    }
  }, [canManageMembers, createPending, getAccessToken, refetchInvitations, tenantKey]);

  const submitRevokeInvitation = useCallback(async (invitationId: string) => {
    const accessToken = getAccessToken();
    if (!canManageMembers || !tenantKey || !accessToken || revokePendingId) return false;

    setRevokePendingId(invitationId);
    setRevokeError(null);
    setAcceptanceUrl(null);

    try {
      await revokeOrganizationInvitation(accessToken, invitationId);
      return await refetchInvitations();
    } catch (error: unknown) {
      setRevokeError(getOrganizationErrorMessage(error));
      return false;
    } finally {
      setRevokePendingId(null);
    }
  }, [canManageMembers, getAccessToken, refetchInvitations, revokePendingId, tenantKey]);

  const submitMemberMutation = useCallback(async (
    membershipId: string,
    operation: (accessToken: string, membershipId: string) => Promise<void>,
  ) => {
    const accessToken = getAccessToken();
    if (!canManageMembers || !tenantKey || !accessToken || memberPendingId) return false;

    setMemberPendingId(membershipId);
    setMemberError(null);

    try {
      await operation(accessToken, membershipId);
      return await refetchMembers();
    } catch (error: unknown) {
      setMemberError(getOrganizationErrorMessage(error));
      return false;
    } finally {
      setMemberPendingId(null);
    }
  }, [canManageMembers, getAccessToken, memberPendingId, refetchMembers, tenantKey]);

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
    activeOrganizationName: session?.activeOrganization?.name ?? null,
    createInvitation: {
      pending: createPending,
      error: createError,
      acceptanceUrl,
      submit: submitCreateInvitation,
      clear: () => {
        setAcceptanceUrl(null);
        setCreateError(null);
      },
    },
    revokeInvitation: {
      pendingId: revokePendingId,
      error: revokeError,
      submit: submitRevokeInvitation,
      clearError: () => setRevokeError(null),
    },
    memberMutation: {
      pendingId: memberPendingId,
      error: memberError,
      suspend: (membershipId) => submitMemberMutation(membershipId, suspendOrganizationMember),
      reactivate: (membershipId) => submitMemberMutation(membershipId, reactivateOrganizationMember),
      remove: (membershipId) => submitMemberMutation(membershipId, removeOrganizationMember),
      clearError: () => setMemberError(null),
    },
    retryMembers: loadMembers,
    retryInvitations: loadInvitations,
  };
}
