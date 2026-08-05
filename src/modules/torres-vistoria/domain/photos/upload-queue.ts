const MAX_CONCURRENT_UPLOADS = 2;

let activeUploads = 0;
const waitQueue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (activeUploads < MAX_CONCURRENT_UPLOADS) {
    activeUploads += 1;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    waitQueue.push(() => {
      activeUploads += 1;
      resolve();
    });
  });
}

function releaseSlot() {
  activeUploads = Math.max(0, activeUploads - 1);
  waitQueue.shift()?.();
}

export async function runPhotoUpload<T>(task: () => Promise<T>): Promise<T> {
  await acquireSlot();
  try {
    return await task();
  } finally {
    releaseSlot();
  }
}
