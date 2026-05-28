import { useSyncExternalStore } from "react";

const MAX_RECENTS = 10;
let recents: string[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function addRecentColor(color: string) {
  if (recents[0] === color) return;
  recents = [color, ...recents.filter((c) => c !== color)].slice(
    0,
    MAX_RECENTS,
  );
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return recents;
}

export function useRecentColors() {
  const recentColors = useSyncExternalStore(subscribe, getSnapshot);
  return { recentColors, addRecentColor };
}
