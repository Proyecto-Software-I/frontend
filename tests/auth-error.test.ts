import { describe, expect, it } from "vitest";

import { getAuthErrorMessage } from "@/features/auth/auth-error";
import { ApiError } from "@/lib/api/api-error";

describe("Auth error mapping", () => {
  it("maps invitation errors to safe messages", () => {
    const error = new ApiError("raw backend failure with token secret", 410, {
      statusCode: 410,
      code: "INVITATION_EXPIRED",
      message: "raw backend failure with token secret",
    });

    const message = getAuthErrorMessage(error, "invitation");

    expect(message).toBe("La invitación expiró. Solicitá una nueva invitación.");
    expect(message).not.toContain("token");
    expect(message).not.toContain("raw backend failure");
  });

  it("keeps unknown invitation errors generic", () => {
    expect(getAuthErrorMessage(new Error("network detail"), "invitation")).toBe(
      "No fue posible procesar la invitación. Intentá nuevamente.",
    );
  });
});
