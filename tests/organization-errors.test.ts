import { describe, expect, it } from "vitest";

import {
  getOrganizationErrorMessage,
  publishedOrganizationErrorCodes,
} from "@/features/organizations/lib/organization-errors";
import { ApiError } from "@/lib/api/api-error";

describe("organization error mapping", () => {
  it("maps every published functional code to a safe message", () => {
    expect(publishedOrganizationErrorCodes).toEqual([
      "TENANT_REQUIRED",
      "MEMBER_ALREADY_EXISTS",
      "INVITATION_ALREADY_PENDING",
      "INVITATION_NOT_FOUND",
      "INVITATION_EXPIRED",
      "INVITATION_REVOKED",
      "INVITATION_ALREADY_ACCEPTED",
      "INVITATION_EMAIL_MISMATCH",
      "MEMBERSHIP_NOT_FOUND",
      "LAST_OWNER_REQUIRED",
      "MEMBER_ACCESS_DENIED",
    ]);

    for (const code of publishedOrganizationErrorCodes) {
      const message = getOrganizationErrorMessage(new ApiError("raw backend token detail", 400, {
        statusCode: 400,
        code,
        message: "raw backend token detail",
      }));
      expect(message).not.toBe("No fue posible completar la solicitud. Intentá nuevamente.");
      expect(message).not.toContain("token");
      expect(message).not.toContain("raw backend");
      expect(message).not.toContain("detail");
    }
  });

  it("uses a safe fallback for unknown errors", () => {
    expect(getOrganizationErrorMessage(new Error("network token detail"))).toBe(
      "No fue posible completar la solicitud. Intentá nuevamente.",
    );
    expect(getOrganizationErrorMessage(new ApiError("raw", 500, {
      statusCode: 500,
      code: "UNKNOWN_BACKEND_CODE",
      message: "raw body with token",
    }))).toBe("No fue posible completar la solicitud. Intentá nuevamente.");
  });
});
