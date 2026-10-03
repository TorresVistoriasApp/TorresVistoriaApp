/**
 * Lock síncrono para emissão oficial.
 * `useState` não impede dois cliques no mesmo tick; este gate sim.
 */
export type ExclusiveGate = {
  tryAcquire: () => boolean;
  release: () => void;
  isHeld: () => boolean;
};

export function createExclusiveGate(): ExclusiveGate {
  let held = false;
  return {
    tryAcquire() {
      if (held) return false;
      held = true;
      return true;
    },
    release() {
      held = false;
    },
    isHeld() {
      return held;
    },
  };
}

export async function runExclusive<T>(
  gate: ExclusiveGate,
  task: () => Promise<T>,
): Promise<{ ran: false } | { ran: true; value: T }> {
  if (!gate.tryAcquire()) return { ran: false };
  try {
    return { ran: true, value: await task() };
  } finally {
    gate.release();
  }
}
