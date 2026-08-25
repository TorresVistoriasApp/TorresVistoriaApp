function createLimiter(maxConcurrent: number) {
  let active = 0;
  const waitQueue: Array<() => void> = [];

  function acquireSlot(): Promise<void> {
    if (active < maxConcurrent) {
      active += 1;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      waitQueue.push(() => {
        active += 1;
        resolve();
      });
    });
  }

  function releaseSlot() {
    active = Math.max(0, active - 1);
    waitQueue.shift()?.();
  }

  return async function runLimited<T>(task: () => Promise<T>): Promise<T> {
    await acquireSlot();
    try {
      return await task();
    } finally {
      releaseSlot();
    }
  };
}

/** Compressão em worker — no máximo 2 fotos ao mesmo tempo. */
export const runPhotoPrepare = createLimiter(2);

/** Uploads de rede — separado da compressão para a próxima foto já ir preparando. */
export const runPhotoUpload = createLimiter(2);
