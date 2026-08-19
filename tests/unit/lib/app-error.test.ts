import { describe, expect, it } from "vitest";
import { getErrorMessage } from "@/core/errors/app-error";

describe("getErrorMessage", () => {
  it("prioriza code do Supabase Auth para tradução de rate limit", () => {
    const authError = {
      name: "AuthApiError",
      message: "email rate limit exceeded",
      status: 429,
      code: "over_email_send_rate_limit",
      __isAuthError: true,
    };

    expect(getErrorMessage(authError)).toBe("over_email_send_rate_limit");
  });
});
