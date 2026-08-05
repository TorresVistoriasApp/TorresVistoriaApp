const CHUNK_RELOAD_KEY = "torres-chunk-reload";

/** Erros de import dinâmico após novo deploy (hash do chunk mudou). */
export function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "";

  const normalized = message.toLowerCase();

  return (
    normalized.includes("failed to fetch dynamically imported module") ||
    normalized.includes("importing a module script failed") ||
    normalized.includes("error loading dynamically imported module") ||
    normalized.includes("failed to load module script")
  );
}

/**
 * Recarrega a página uma vez quando um chunk lazy não existe mais (deploy recente).
 * Evita loop infinito via sessionStorage.
 */
export function reloadOnceOnChunkLoadError(error: unknown): boolean {
  if (!isChunkLoadError(error)) return false;
  if (typeof window === "undefined") return false;

  if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
    window.location.reload();
    return true;
  }

  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  return false;
}

export function clearChunkReloadFlag(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
}

export function hardReloadApp(): void {
  if (typeof window === "undefined") return;
  clearChunkReloadFlag();
  window.location.reload();
}
