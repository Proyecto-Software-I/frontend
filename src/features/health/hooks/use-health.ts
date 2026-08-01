"use client";

import { useCallback, useEffect, useState } from "react";
import { getHealth } from "../api/get-health";
import type { HealthResponse } from "../types/health";

export type HealthStatus =
  | "loading"
  | "online"
  | "offline";

interface UseHealthResult {
  data: HealthResponse | null;
  status: HealthStatus;
  error: string | null;
  checkedAt: Date | null;
  refresh: () => Promise<void>;
}

export function useHealth(): UseHealthResult {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [status, setStatus] =
    useState<HealthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setStatus("loading");
    setError(null);

    try {
      const health = await getHealth();

      setData(health);
      setStatus("online");
    } catch (caughtError: unknown) {
      setData(null);
      setStatus("offline");

      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        setError("El backend tardó demasiado en responder.");
      } else if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("No fue posible conectar con el backend.");
      }
    } finally {
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    status,
    error,
    checkedAt,
    refresh,
  };
}