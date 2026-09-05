import { describe, expect, it } from "vitest";

import { getValidInvitationReturnTo } from "@/features/auth/lib/invitation-return";

describe("invitation return validation", () => {
  it("accepts an internal invitation route", () => {
    expect(getValidInvitationReturnTo("/invite/token-123")).toBe("/invite/token-123");
  });

  it("rejects unsafe or unsupported return destinations", () => {
    expect(getValidInvitationReturnTo("https://evil.example/invite/token-123")).toBeNull();
    expect(getValidInvitationReturnTo("//evil.example/invite/token-123")).toBeNull();
    expect(getValidInvitationReturnTo("/dashboard")).toBeNull();
    expect(getValidInvitationReturnTo("/invite/")).toBeNull();
    expect(getValidInvitationReturnTo("/invite/token%2Fother")).toBeNull();
    expect(getValidInvitationReturnTo("/invite/%E0%A4%A")).toBeNull();
    expect(getValidInvitationReturnTo(null)).toBeNull();
  });
});
