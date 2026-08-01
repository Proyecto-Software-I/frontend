"use client";

import { useCallback, useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  service: string;
}

type ConnectionStatus = "loading" | "online" | "offline";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.status === "string" &&
    typeof response.service === "string"
  );
}

export default function Home() {
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [message, setMessage] = useState(
    "Intentando conectar con el backend.",
  );
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const checkBackend = useCallback(async (): Promise<void> => {
    setStatus("loading");
    setMessage("Intentando conectar con el backend.");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_URL}/api/health`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`El backend respondió con HTTP ${response.status}.`);
      }

      const data: unknown = await response.json();

      if (!isHealthResponse(data)) {
        throw new Error("El backend devolvió una respuesta inesperada.");
      }

      if (data.status !== "ok") {
        throw new Error(`El backend informó el estado "${data.status}".`);
      }

      setHealth(data);
      setStatus("online");
      setMessage("La conexión con el backend funciona correctamente.");
    } catch (error: unknown) {
      setHealth(null);
      setStatus("offline");

      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("El backend tardó demasiado en responder.");
      } else if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("No fue posible conectar con el backend.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    void checkBackend();
  }, [checkBackend]);

  const presentation = {
    loading: {
      title: "Comprobando backend",
      label: "Comprobando",
      dotClass: "bg-amber-400 animate-pulse",
      badgeClass:
        "border-amber-400/30 bg-amber-400/10 text-amber-200",
    },
    online: {
      title: "Backend disponible",
      label: "En línea",
      dotClass: "bg-emerald-400",
      badgeClass:
        "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    },
    offline: {
      title: "Backend no disponible",
      label: "Sin conexión",
      dotClass: "bg-rose-400",
      badgeClass:
        "border-rose-400/30 bg-rose-400/10 text-rose-200",
    },
  }[status];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_36%)]" />

      <section
        className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-black/30 backdrop-blur sm:p-10"
        aria-live="polite"
        aria-busy={status === "loading"}
      >
        <header className="mb-10">
          <div className="mb-5 inline-flex items-center rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm font-medium text-blue-200">
            Proyecto Software I
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Estado de los servicios
          </h1>

          <p className="mt-3 max-w-md leading-7 text-slate-400">
            Esta pantalla comprueba que el frontend puede comunicarse con la
            API del backend.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${presentation.badgeClass}`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${presentation.dotClass}`}
                />
                {presentation.label}
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                {presentation.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void checkBackend()}
              disabled={status === "loading"}
              className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading"
                ? "Comprobando..."
                : "Volver a comprobar"}
            </button>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-white/10 pt-6 text-sm">
            <div className="grid gap-1 sm:grid-cols-[120px_1fr]">
              <dt className="text-slate-500">Endpoint</dt>
              <dd className="break-all font-mono text-slate-300">
                {API_URL}/api/health
              </dd>
            </div>

            <div className="grid gap-1 sm:grid-cols-[120px_1fr]">
              <dt className="text-slate-500">Servicio</dt>
              <dd className="text-slate-300">
                {health?.service ?? "No disponible"}
              </dd>
            </div>

            <div className="grid gap-1 sm:grid-cols-[120px_1fr]">
              <dt className="text-slate-500">Última revisión</dt>
              <dd className="text-slate-300">
                {checkedAt
                  ? checkedAt.toLocaleTimeString("es-BO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "Pendiente"}
              </dd>
            </div>
          </dl>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-600">
          Next.js frontend · NestJS backend
        </footer>
      </section>
    </main>
  );
}