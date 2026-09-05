"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api/api-error";

import { getInvitationPreview } from "../api/organization-members-api";
import type { InvitationPreview } from "../types/organizations";

export type InvitationPreviewStatus =
  | "loading"
  | "valid"
  | "not-found"
  | "expired"
  | "revoked"
  | "accepted"
  | "error";

interface InvitationPreviewState {
  status: InvitationPreviewStatus;
  preview: InvitationPreview | null;
  retry: () => void;
}

export function useInvitationPreview(token: string): InvitationPreviewState {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Omit<InvitationPreviewState, "retry"> & { token: string | null }>({
    status: "loading",
    preview: null,
    token: null,
  });
  const requestRef = useRef(0);

  useEffect(() => {
    const request = requestRef.current + 1;
    requestRef.current = request;
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;
      setState({ status: "loading", preview: null, token });
      return getInvitationPreview(token).then(
        (preview) => {
          if (requestRef.current !== request) return;
          setState({ status: "valid", preview, token });
        },
        (error: unknown) => {
          if (requestRef.current !== request) return;
          setState({ status: previewErrorStatus(error), preview: null, token });
        },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [attempt, token]);

  return {
    status: state.token === token ? state.status : "loading",
    preview: state.token === token ? state.preview : null,
    retry: useCallback(() => setAttempt((current) => current + 1), []),
  };
}

function previewErrorStatus(error: unknown): InvitationPreviewStatus {
  const code = error instanceof ApiError ? error.code : null;

  switch (code) {
    case "INVITATION_NOT_FOUND":
      return "not-found";
    case "INVITATION_EXPIRED":
      return "expired";
    case "INVITATION_REVOKED":
      return "revoked";
    case "INVITATION_ALREADY_ACCEPTED":
      return "accepted";
    default:
      return "error";
  }
}
