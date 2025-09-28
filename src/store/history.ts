import {StateCreator} from "zustand/vanilla";
import {HistorySlice, RootState} from "./types.ts";
import {UndoableCommand} from "./UndoableCommand.ts";

export type History = {
  past: UndoableCommand[];
  future: UndoableCommand[];
};

export function createHistory(): History {
  return { past: [], future: [] };
}

export const createHistorySlice: StateCreator<
  RootState,
  [["zustand/immer", never]],
  [],
  HistorySlice
> = (set, get) => ({
  // state
  histories: {},

  // mutators
  undo: () => {},
  redo: () => {},

  // accessors
  hasUndos: () => {
    const { screenSet, activeScreenIndex, histories } = get();
    if (!screenSet || activeScreenIndex === null) return false;
    const activeScreenId = screenSet.screens[activeScreenIndex].id;
    return (histories[activeScreenId]?.past?.length ?? 0) > 0;
  },
  hasRedos: () => {
    const { screenSet, activeScreenIndex, histories } = get();
    if (!screenSet || activeScreenIndex === null) return false;
    const activeScreenId = screenSet.screens[activeScreenIndex].id;
    return (histories[activeScreenId]?.future?.length ?? 0) > 0;
  },
});
