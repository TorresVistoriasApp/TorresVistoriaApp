import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  encodeUnsignedJwt,
  findInspectorDocumentLeaks,
} from "../../../security/inspector-document-leak";

const DOCUMENT = "52998224725";
const EDGE_SIGNUP = path.resolve(process.cwd(), "supabase/functions/inspector-signup/index.ts");
const MIGRATION = path.resolve(
  process.cwd(),
  "supabase/migrations/20260902150000_fase_a_inspector_signup_intent.sql",
);

describe("pós-cadastro de vistoriador — o documento não pode vazar", () => {
  it("detecta documento no JWT e no user_metadata (controle negativo)", () => {
    const jwt = encodeUnsignedJwt({
      sub: "user-1",
      user_metadata: { document: DOCUMENT, user_type: "inspector" },
    });
    const leaks = findInspectorDocumentLeaks(DOCUMENT, {
      signUpResponse: { user: { user_metadata: { document: DOCUMENT } }, session: { access_token: jwt } },
    });
    expect(leaks.length).toBeGreaterThan(0);
    expect(leaks.some((path) => path.includes("user_metadata") || path.includes("jwt"))).toBe(true);
  });

  it("não encontra o documento em nenhum artefato Auth/Edge após o fluxo concluir", () => {
    const jwt = encodeUnsignedJwt({
      sub: "user-1",
      email: "ana@empresa.com",
      user_metadata: {
        full_name: "Ana Vistoriadora",
        user_type: "inspector",
        document_type: "cpf",
        signup_intent_id: "11111111-1111-4111-8111-111111111111",
      },
      app_metadata: { provider: "email" },
    });
    const refreshToken = "opaque-refresh-token-not-a-jwt";
    const session = {
      access_token: jwt,
      refresh_token: refreshToken,
      token_type: "bearer",
      user: {
        id: "user-1",
        email: "ana@empresa.com",
        user_metadata: {
          full_name: "Ana Vistoriadora",
          user_type: "inspector",
          document_type: "cpf",
          signup_intent_id: "11111111-1111-4111-8111-111111111111",
        },
      },
    };

    const artifacts = {
      signUpResponse: { user: session.user, session: null },
      user: session.user,
      user_metadata: session.user.user_metadata,
      sessaoRetornada: null,
      jwt: session.access_token,
      refreshToken,
      chamadasSubsequentes: {
        getUser: { user: session.user },
        getSession: { session: null },
        refreshSession: { session: null },
      },
      edgeFunctionResponse: { success: true },
      edgeFunctionLogs: [],
    };

    expect(findInspectorDocumentLeaks(DOCUMENT, artifacts)).toEqual([]);
  });

  it("janela imediata após o signUp: sem sessão, sem JWT e sem documento em storage/logs", () => {
    const artifacts = {
      respostaCadastro: { success: true },
      user: null,
      user_metadata: null,
      sessaoRetornada: null,
      jwt: null,
      refreshToken: null,
      chamadasSubsequentes: { getSession: null, getUser: null },
      localStorage: {},
      sessionStorage: {},
      edgeFunctionLogs: [],
    };
    expect(findInspectorDocumentLeaks(DOCUMENT, artifacts)).toEqual([]);
  });

  it("a Edge de cadastro não devolve sessão/JWT nem registra o documento", () => {
    const src = readFileSync(EDGE_SIGNUP, "utf8");
    expect(src).toContain('JSON.stringify({ success: true })');
    expect(src).not.toContain("console.log");
    expect(src).not.toContain("console.info");
    expect(src).not.toContain("console.debug");
    expect(src).not.toContain("access_token");
    expect(src).not.toContain("refresh_token");
    expect(src).not.toMatch(/user_metadata:\s*\{[^}]*document:/);
    expect(src).toContain("prepare_inspector_signup");
    expect(src).toContain("signup_intent_id");
  });

  it("handle_new_user consome intent HMAC e recusa inspector sem canal seguro", () => {
    const sql = readFileSync(MIGRATION, "utf8");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS private.inspector_signup_intents");
    expect(sql).toContain("prepare_inspector_signup");
    expect(sql).toContain("signup_intent_id");
    expect(sql).toContain("Cadastro de vistoriador exige canal seguro.");
    expect(sql).not.toContain("private.hmac_inspector_document(v_document_digits)");
  });
});
