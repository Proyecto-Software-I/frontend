import { ApiError } from "@/lib/api/api-error";

const messages: Record<string, string> = {
  TENANT_REQUIRED: "Seleccioná una organización para continuar.",
  MEMBER_ALREADY_EXISTS: "La persona ya pertenece a esta organización.",
  INVITATION_ALREADY_PENDING: "Ya existe una invitación pendiente para ese email.",
  INVITATION_NOT_FOUND: "La invitación no existe o ya no está disponible.",
  INVITATION_EXPIRED: "La invitación expiró. Solicitá una nueva invitación.",
  INVITATION_REVOKED: "La invitación fue revocada. Solicitá una nueva invitación.",
  INVITATION_ALREADY_ACCEPTED: "La invitación ya fue utilizada.",
  INVITATION_EMAIL_MISMATCH: "La invitación corresponde a otra cuenta.",
  MEMBERSHIP_NOT_FOUND: "El miembro no existe o ya no está disponible.",
  LAST_OWNER_REQUIRED: "La organización debe mantener al menos un owner activo.",
  MEMBER_ACCESS_DENIED: "No tenés permisos para administrar miembros de esta organización.",
};

export function getOrganizationErrorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : null;

  if (code && messages[code]) {
    return messages[code];
  }

  return "No fue posible completar la solicitud. Intentá nuevamente.";
}

export const publishedOrganizationErrorCodes = Object.keys(messages);
