export interface HealthResponse {
  status: "ok";
  service: string;
}

export function isHealthResponse(
  value: unknown,
): value is HealthResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    response.status === "ok" &&
    typeof response.service === "string"
  );
}