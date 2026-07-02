import { db } from "@/lib/db-client";
import { AppError, getErrorMessage } from "@/lib/errors";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";

const EXPIRY_BUFFER_SECONDS = 60;

export function isSessionExpiredError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return /"exp"\s+claim|exp claim|jwt expired|session expired|invalid jwt|token has expired/i.test(
    message,
  );
}

export async function ensureFreshSession(): Promise<void> {
  const {
    data: { session },
  } = await db.auth.getSession();

  if (!session) {
    throw new AppError(USER_MESSAGES.notAuthenticated);
  }

  const expiresAt = session.expires_at ?? 0;
  const now = Math.floor(Date.now() / 1000);

  if (expiresAt <= now + EXPIRY_BUFFER_SECONDS) {
    const { error } = await db.auth.refreshSession();
    if (error) {
      throw new AppError(formatUserFacingError(getErrorMessage(error)));
    }
  }
}

export async function withFreshSession<T>(operation: () => Promise<T>): Promise<T> {
  await ensureFreshSession();
  try {
    return await operation();
  } catch (error) {
    if (!isSessionExpiredError(error)) throw error;

    const { error: refreshError } = await db.auth.refreshSession();
    if (refreshError) {
      throw new AppError(formatUserFacingError(getErrorMessage(refreshError)));
    }

    return await operation();
  }
}
