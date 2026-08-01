"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const badgeVariant =
      status === "online"
          ? "default"
          : status === "offline"
              ? "destructive"
              : "secondary";

  const statusLabel =
      status === "online"
          ? "Backend disponible"
          : status === "offline"
              ? "Backend no disponible"
              : "Comprobando";

  const description =
      status === "online" && data
          ? `Servicio: ${data.service}`
          : status === "loading"
              ? "Intentando conectar con el backend."
              : error ?? "No fue posible conectar con el backend.";

  return (
      <Card
          className="w-full max-w-xl"
          aria-live="polite"
          aria-busy={isLoading}
      >
        <CardHeader>
          <Badge
              variant={badgeVariant}
              className="w-fit"
          >
            {statusLabel}
          </Badge>

          <CardTitle className="text-2xl">
            Estado del backend
          </CardTitle>

          <CardDescription>
            Comprueba la comunicación entre el frontend y la API.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium">
              Resultado
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">
              Última comprobación
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {checkedAt
                  ? checkedAt.toLocaleTimeString("es-BO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                  : "Pendiente"}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Endpoint de diagnóstico del backend
          </p>

          <Button
              type="button"
              onClick={() => void refresh()}
              disabled={isLoading}
              variant={isOnline ? "outline" : "default"}
          >
            {isLoading
                ? "Comprobando..."
                : "Volver a comprobar"}
          </Button>
        </CardFooter>
      </Card>
  );
}