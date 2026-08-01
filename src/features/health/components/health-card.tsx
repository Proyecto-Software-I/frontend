"use client";

import { useHealth } from "../hooks/use-health";

export function HealthCard() {
  const {
    data,
    status,
    error,
    checkedAt,
    refresh,
  } = useHealth();

  const isLoading = status === "loading";
  const isOnline = status === "online";

  return (
    <section
      className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <p className="text-sm font-medium text-blue-300">
        Proyecto Software I
      </p>

      <h1 className="mt-3 text-3xl font-semibold text-white">
        Estado del backend
      </h1>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950 p-6">
        <div className="flex items-center gap-3">
          <span
            className={[
              "h-3 w-3 rounded-full",
              isLoading
                ? "animate-pulse bg-amber-400"
                : isOnline
                  ? "bg-emerald-400"
                  : "bg-rose-400",
            ].join(" ")}
          />

          <span className="font-medium text-white">
            {isLoading
              ? "Comprobando"
              : isOnline
                ? "Backend disponible"
                : "Backend no disponible"}
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          {isOnline
            ? `Servicio: ${data?.service}`
            : error ?? "Esperando respuesta."}
        </p>

        <p className="mt-2 text-xs text-slate-600">
          Última comprobación:{" "}
          {checkedAt
            ? checkedAt.toLocaleTimeString("es-BO")
            : "Pendiente"}
        </p>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading}
          className="mt-6 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          {isLoading
            ? "Comprobando..."
            : "Volver a comprobar"}
        </button>
      </div>
    </section>
  );
}