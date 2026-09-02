import { describe, expect, it } from "vitest";
import {
  indexInspectorDocumentHashes,
  inspectorDocumentHashMatches,
} from "@/core/auth/inspector-document-hash";

describe("inspectorDocumentHashMatches", () => {
  it("aceita HMAC atual", () => {
    expect(inspectorDocumentHashMatches("hmac-abc", "hmac-abc", "sha-legacy")).toBe(true);
  });

  it("aceita SHA-256 legado de cadastros anteriores à Fase A", () => {
    expect(inspectorDocumentHashMatches("sha-legacy", "hmac-abc", "sha-legacy")).toBe(true);
  });

  it("rejeita hash que não casa com HMAC nem com legado", () => {
    expect(inspectorDocumentHashMatches("outro", "hmac-abc", "sha-legacy")).toBe(false);
  });
});

describe("indexInspectorDocumentHashes", () => {
  it("indexa HMAC e SHA-256 no mesmo tenant sugerido", () => {
    const map = new Map<string, { id: string }>();
    const company = { id: "tenant-a" };
    indexInspectorDocumentHashes(map, company, ["hmac-abc", "sha-legacy"]);

    expect(map.get("hmac-abc")).toEqual(company);
    expect(map.get("sha-legacy")).toEqual(company);
  });
});
