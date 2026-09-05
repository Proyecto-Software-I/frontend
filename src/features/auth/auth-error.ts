import { ApiError } from "@/lib/api/api-error";

export function getAuthErrorMessage(
  error: unknown,
  context: "login" | "register" | "selection" | "session" | "logout" | "invitation",
): string {
  const code = error instanceof ApiError ? error.code : null;

  const messages: Record<string, string> = {
    VALIDATION_ERROR: "Revisa los datos ingresados.",
    EMAIL_ALREADY_REGISTERED: "Ese email ya está registrado.",
    INVALID_CREDENTIALS: "El email o la contraseña no son válidos.",
    USER_NOT_ACTIVE: "Tu usuario no está activo.",
    NO_ACTIVE_MEMBERSHIP: "Tu usuario no tiene una organización activa.",
    ORGANIZATION_ACCESS_DENIED: "No tenés acceso a esa organización.",
    INVITATION_NOT_FOUND: "La invitación no existe o ya no está disponible.",
    INVITATION_EXPIRED: "La invitación expiró. Solicitá una nueva invitación.",
    INVITATION_REVOKED: "La invitación fue revocada. Solicitá una nueva invitación.",
    INVITATION_ALREADY_ACCEPTED: "La invitación ya fue utilizada.",
    INVITATION_EMAIL_MISMATCH: "La invitación corresponde a otra cuenta.",
    SESSION_EXPIRED: "Tu sesión expiró. Ingresá nuevamente.",
    SESSION_REVOKED: "Tu sesión ya no está disponible. Ingresá nuevamente.",
    UNAUTHORIZED: "No fue posible autenticar la solicitud. Ingresá nuevamente.",
    FORBIDDEN: "No tenés permisos para completar esta acción.",
    CONFLICT: "La solicitud entra en conflicto con el estado actual.",
  };

  if (code && messages[code]) {
    return messages[code];
  }

  if (context === "selection") {
    return "No fue posible seleccionar la organización. Intentá nuevamente.";
  }

  if (context === "session") {
    return "No fue posible restaurar la sesión. Ingresá nuevamente.";
  }

  if (context === "logout") {
    return "No fue posible cerrar la sesión. Intentá nuevamente.";
  }

  if (context === "invitation") {
    return "No fue posible procesar la invitación. Intentá nuevamente.";
  }

  return "No fue posible completar la solicitud. Intentá nuevamente.";
}
