/**
 * Computes a minimal patch representing changes from `prev` to `next`.
 *
 * Returns `undefined` if objects are deeply equal (no changes detected).
 * For plain objects, returns a partial containing only changed keys.
 * Recursively diffs nested plain objects to create minimal nested patches.
 */
export const diffPartial = <T>(prev: T, next: T): Partial<T> | undefined => {
  if (Object.is(prev, next)) return;

  if (Array.isArray(prev) || Array.isArray(next)) {
    if (!Array.isArray(prev) || !Array.isArray(next)) return next;
    return deepEqual(prev, next) ? undefined : next;
  }

  if (!isPlainObject(prev) || !isPlainObject(next)) return next;

  const out: Record<string, unknown> = {};
  for (const key of Object.keys(next)) {
    const before = prev[key];
    const after = next[key];

    if (Object.is(before, after)) continue;

    if (isPlainObject(before) && isPlainObject(after)) {
      const nested = diffPartial(before, after);
      if (nested !== undefined) out[key] = nested;
      continue;
    }

    if (Array.isArray(before) && Array.isArray(after)) {
      if (before.length !== after.length || !deepEqual(before, after)) {
        out[key] = after;
      }

      continue;
    }

    out[key] = after;
  }

  return Object.keys(out).length > 0 ? (out as Partial<T>) : undefined;
};

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }

    return true;
  }

  if (isPlainObject(a) || isPlainObject(b)) {
    if (!isPlainObject(a) || !isPlainObject(b)) return false;

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    const bKeySet = new Set(bKeys);
    for (const key of aKeys) {
      if (!bKeySet.has(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';
