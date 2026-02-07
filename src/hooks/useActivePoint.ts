import { useCallback, useRef, useSyncExternalStore } from 'react';

type Listener = () => void;

/**
 * Shared observable store for the currently-hovered point index.
 * Both MapView and GeoProfile subscribe to the same instance so that
 * hovering one view highlights the corresponding position in the other.
 */
function createActivePointStore() {
  let index: number | null = null;
  const listeners = new Set<Listener>();

  return {
    getSnapshot: () => index,
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (newIndex: number | null) => {
      if (newIndex === index) return;
      index = newIndex;
      listeners.forEach((l) => l());
    },
  };
}

export type ActivePointStore = ReturnType<typeof createActivePointStore>;

/**
 * Hook that creates a single shared ActivePointStore per component tree.
 * Call once in App and pass the store down to MapView + GeoProfile.
 */
export function useActivePointStore(): ActivePointStore {
  const storeRef = useRef<ActivePointStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createActivePointStore();
  }
  return storeRef.current;
}

/** Subscribe to the current active point index. */
export function useActivePoint(store: ActivePointStore): number | null {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

/** Returns a stable setter for the active point index. */
export function useSetActivePoint(store: ActivePointStore) {
  return useCallback((idx: number | null) => store.set(idx), [store]);
}
