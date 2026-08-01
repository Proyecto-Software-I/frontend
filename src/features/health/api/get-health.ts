import { apiRequest } from "@/lib/api/api-client";
import {
  HealthResponse,
  isHealthResponse,
} from "../types/health";

export async function getHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  const response = await apiRequest<unknown>("/api/health", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!isHealthResponse(response)) {
    throw new Error(
      "El backend devolvió una respuesta de health inesperada.",
    );
  }

  return response;
}