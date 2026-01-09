import {$isPending} from '$shared/signals';

export async function trackPending<T>(action: () => Promise<T>): Promise<T> {
  $isPending.set(true);

  try {
    return await action();
  } finally {
    $isPending.set(false);
  }
}
