import { ApiError } from "@/lib/api/api-error";

export function getRbacErrorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : null;

  const messages: Record<string, string> = {
    ROLE_NOT_FOUND: "El rol seleccionado ya no existe.",
    ROLE_ALREADY_EXISTS: "Ya existe un rol con ese nombre en esta organización.",
    ROLE_IS_SYSTEM: "Los roles de sistema no se pueden modificar en esta pantalla.",
    ROLE_IN_USE: "No podés eliminar este rol porque todavía está asignado a miembros.",
    ROLE_SCOPE_INVALID: "El rol seleccionado no corresponde al alcance de organización.",
    ROLE_ACCESS_DENIED: "No tenés permisos para administrar roles.",
    PERMISSION_NOT_FOUND: "Uno o más permisos seleccionados no existen.",
    MEMBERSHIP_NOT_FOUND: "La membresía seleccionada ya no existe.",
    CROSS_TENANT_ROLE: "No podés asignar roles que pertenezcan a otra organización.",
    FORBIDDEN: "No tenés permisos para completar esta acción.",
  };

  if (code && messages[code]) {
    return messages[code];
  }

  return "No fue posible completar la operación de roles y permisos. Intentá nuevamente.";
}
