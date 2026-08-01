"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getHealth } from "../api/get-health";
import type { HealthResponse } from "../types/health";

export type HealthStatus = "loading" | "online" | "offline";

interface HealthState {
  data: HealthResponse | null;
  status: HealthStatus;
  error: string | null;
  checkedAt: Date | null;
}

interface UseHealthResult extends HealthState {
  refresh: () => Promise<void>;
}

type HealthCheckResult =
    | {
  data: HealthResponse;
  status: "online";
  error: null;
}
    | {
  data: null;
  status: "offline";
  error: string;
};

const initialState: HealthState = {
  data: null,
  status: "loading",
  error: null,
  checkedAt: null,
};

function getErrorMessage(error: unknown): string {
  if (
      error instanceof DOMException &&
      error.name === "AbortError"
  ) {
    return "El backend tardó demasiado en responder.";
  }

  if (error instanceof TypeError) {
    return (
        "No fue posible conectar con el backend. " +
        "Comprueba el servidor y la configuración de CORS."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible conectar con el backend.";
}

async function performHealthCheck(
    signal?: AbortSignal,
): Promise<HealthCheckResult> {
  try {
    const health = await getHealth(signal);

    return {
      data: health,
      status: "online",
      error: null,
    };
  } catch (error: unknown) {
    return {
      data: null,
      status: "offline",
      error: getErrorMessage(error),
    };
  }
}

export function useHealth(): UseHealthResult {
  const [state, setState] = useState<HealthState>(initialState);

  const requestIdRef = useRef(0);

  const refresh = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;

    setState((currentState) => ({
      ...currentState,
      status: "loading",
      error: null,
    }));

    const result = await performHealthCheck();

    if (requestId !== requestIdRef.current) {
      return;
    }

    setState({
      ...result,
      checkedAt: new Date(),
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    void performHealthCheck(controller.signal).then((result) => {
      if (
          controller.signal.aborted ||
          requestId !== requestIdRef.current
      ) {
        return;
      }

      setState({
        ...result,
        checkedAt: new Date(),
      });
    });

    return () => {
      controller.abort();
      requestIdRef.current += 1;
    };
  }, []);

  return {
    ...state,
    refresh,
  };
}