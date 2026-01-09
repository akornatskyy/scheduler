export type Signal<T> = {
  subscribe: (cb: () => void) => () => void;
  get: () => T;
  set: (value: T) => void;
};

export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const listeners = new Set<() => void>();

  return {
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    get: () => value,
    set: (newValue: T) => {
      if (Object.is(value, newValue)) return;
      value = newValue;
      for (const cb of listeners) cb();
    },
  };
}

export function defer(
  source: Signal<boolean>,
  delayMs: number,
  minShowMs: number,
): Signal<boolean> {
  const s = signal(source.get());
  let timer: ReturnType<typeof setTimeout>;
  let startTime = 0;

  source.subscribe(() => {
    const isBusy = source.get();
    clearTimeout(timer);

    if (isBusy) {
      timer = setTimeout(() => {
        startTime = Date.now();
        s.set(true);
      }, delayMs);
    } else {
      if (!s.get()) return;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minShowMs - elapsed);
      setTimeout(() => s.set(false), remaining);
    }
  });

  return s;
}
