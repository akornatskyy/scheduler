import {Signal} from '$shared/lib';
import {useSyncExternalStore} from 'react';

export const useSignal = <T>(s: Signal<T>): T =>
  useSyncExternalStore(s.subscribe, s.get);
