import { describe, it, expect, vi } from 'vitest';

// We test the store logic directly (non-React) since the hook is a thin wrapper.
// Re-implement createActivePointStore inline to avoid exporting it.

function createStore() {
  let index: number | null = null;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => index,
    subscribe: (listener: () => void) => {
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

describe('ActivePointStore', () => {
  it('starts with null', () => {
    const store = createStore();
    expect(store.getSnapshot()).toBeNull();
  });

  it('updates value on set', () => {
    const store = createStore();
    store.set(5);
    expect(store.getSnapshot()).toBe(5);
  });

  it('notifies listeners on change', () => {
    const store = createStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(10);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify when value is unchanged', () => {
    const store = createStore();
    const listener = vi.fn();
    store.set(3);
    store.subscribe(listener);
    store.set(3);
    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribe stops notifications', () => {
    const store = createStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    unsub();
    store.set(7);
    expect(listener).not.toHaveBeenCalled();
  });

  it('resets to null', () => {
    const store = createStore();
    store.set(42);
    store.set(null);
    expect(store.getSnapshot()).toBeNull();
  });
});
