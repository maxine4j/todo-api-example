type CleanupCallback = () => Promise<void>;

export interface LifecycleManager {
  registerCleanupCallback: (callback: CleanupCallback) => void
  cleanup: () => Promise<void>
}

export const createLifecycleManager = (): LifecycleManager => {
  const cleanupCallbacks: CleanupCallback[] = [];
  let running = true;

  return {
    registerCleanupCallback: listener => cleanupCallbacks.push(listener),
    cleanup: async () => {
      if (!running) return;
      running = false;
      await Promise.all(cleanupCallbacks.map(callback => callback()));
    },
  };
};
