import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACTIVE_DRAFT_SERVICE_KEY,
  ACTIVE_DRAFT_STORAGE_KEY,
} from "@/modules/torres-vistoria/draft/lib/constants";
import {
  clearActiveDraftLocalState,
  rememberActiveDraftId,
  rememberActiveDraftServiceId,
} from "@/modules/torres-vistoria/draft/services/draft-service";

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe("clearActiveDraftLocalState", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("remove ponteiros locais do draft sem afetar outras chaves", () => {
    rememberActiveDraftId("draft-a");
    rememberActiveDraftServiceId("service-a");
    localStorage.setItem("torres:unrelated", "keep");

    clearActiveDraftLocalState();

    expect(localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(ACTIVE_DRAFT_SERVICE_KEY)).toBeNull();
    expect(localStorage.getItem("torres:unrelated")).toBe("keep");
  });
});
