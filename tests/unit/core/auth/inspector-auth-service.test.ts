import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InspectorRegisterInput } from "@/core/auth/schemas/inspector-auth";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  signUpInspector: vi.fn(),
  stripOwnAuthDocumentMetadata: vi.fn(),
  signOut: vi.fn(),
  getSelfConsumer: vi.fn(),
  getSelfInspector: vi.fn(),
}));

vi.mock("@/core/auth/services/supabase-auth-adapter", () => ({
  supabaseAuthAdapter: {
    signUp: mocks.signUp,
    signUpInspector: mocks.signUpInspector,
    stripOwnAuthDocumentMetadata: mocks.stripOwnAuthDocumentMetadata,
    signOut: mocks.signOut,
  },
}));

vi.mock("@/core/auth/consumer-profile-service", () => ({
  consumerProfileService: { getSelf: mocks.getSelfConsumer },
}));

vi.mock("@/core/auth/inspector-registration-service", () => ({
  inspectorRegistrationService: { getSelf: mocks.getSelfInspector },
  isPendingInspectorRegistration: (registration: { status?: string } | null) =>
    registration?.status === "pending_approval",
  isRejectedInspectorRegistration: (registration: { status?: string } | null) =>
    registration?.status === "rejected",
}));

import { inspectorAuthService } from "@/core/auth/services/inspector-auth-service";

const REGISTER_INPUT: InspectorRegisterInput = {
  name: "Ana Vistoriadora",
  email: "ana@empresa.com",
  phone: "(11) 98888-7777",
  documentType: "cpf",
  document: "529.982.247-25",
  password: "SenhaForte1!xyz",
  confirmPassword: "SenhaForte1!xyz",
  acceptTerms: true,
};

describe("inspectorAuthService — privacidade do documento (Fase A)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signUpInspector.mockResolvedValue(undefined);
    mocks.stripOwnAuthDocumentMetadata.mockResolvedValue(undefined);
    mocks.getSelfConsumer.mockResolvedValue(null);
    mocks.getSelfInspector.mockResolvedValue({ status: "pending_approval" });
  });

  it("envia o documento só à Edge e nunca ao Auth signUp", async () => {
    await inspectorAuthService.signUp(REGISTER_INPUT);

    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.signUpInspector).toHaveBeenCalledWith({
      name: "Ana Vistoriadora",
      email: "ana@empresa.com",
      phone: "(11) 98888-7777",
      document: "52998224725",
      documentType: "cpf",
      password: "SenhaForte1!xyz",
      acceptTerms: true,
    });
  });

  it("remove documento residual da sessão no login de vistoriador", async () => {
    await inspectorAuthService.validateTenantLogin("u1");
    expect(mocks.stripOwnAuthDocumentMetadata).toHaveBeenCalledTimes(1);
  });

  it("não tenta limpar metadata se a conta for de consumidor", async () => {
    mocks.getSelfConsumer.mockResolvedValue({ id: "u1" });
    await expect(inspectorAuthService.validateTenantLogin("u1")).rejects.toThrow(
      /Torres Consulta/,
    );
    expect(mocks.stripOwnAuthDocumentMetadata).not.toHaveBeenCalled();
    expect(mocks.signOut).toHaveBeenCalled();
  });
});
