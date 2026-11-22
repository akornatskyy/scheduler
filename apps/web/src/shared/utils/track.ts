import type {Signal} from '$shared/lib/signals';

export function createTracker($signal: Signal<boolean>) {
  let counter = 0;

  return async function track<T>(action: () => Promise<T>): Promise<T> {
    if (counter++ === 0) $signal.set(true);

    try {
      return await action();
    } finally {
      if (--counter === 0) $signal.set(false);
    }
  };
}
