import { useSyncExternalStore } from 'react';

import { getSnapshot, subscribe } from './store';
import type { LocalState } from './store';

export function useLocalStore(): LocalState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
