import type {Signal} from '$shared/lib/signals';
import {useSyncExternalStore} from 'react';

export const useSignal = <T>(s: Signal<T>): T =>
  useSyncExternalStore(s.subscribe, s.get);
