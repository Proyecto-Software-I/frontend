import { ApiError } from "./api-error";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    timeout = 5000,
    headers,
    signal,
    ...requestOptions
  } = options;

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  if (signal) {
    signal.addEventListener(
      "abort",
      () => controller.abort(),
      { once: true },
    );
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers: {
        Accept: "application/json",
        ...headers,
      },
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");
    const hasJsonBody = contentType?.includes("application/json");

    const body: unknown = hasJsonBody
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(
        `La solicitud falló con HTTP ${response.status}.`,
        response.status,
        body,
      );
    }

    return body as T;
  } finally {
    clearTimeout(timeoutId);
  }
}