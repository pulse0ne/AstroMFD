import {StateCreator} from "zustand/vanilla";
import {HistorySlice, RootState} from "./types.ts";
import {UndoableCommand} from "./command.ts";

const HISTORY_LIMIT = 50;

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
  addCommand: (cmd: UndoableCommand) => {
    const { screenSet, activeScreenIndex, histories } = get();
    if (!screenSet || activeScreenIndex === null) return;
    const screenId =  screenSet.screens[activeScreenIndex].id;
    let history: History;
    if (!histories[screenId]) {
      history = createHistory();
      set((state) => {
        state.histories[screenId] = history;
      });
    } else {
      history = histories[screenId];
    }
    set((state) => {
      // TODO: coalescing?
      while (state.histories[screenId].past.length > HISTORY_LIMIT) {
        state.histories[screenId].past.shift();
      }
      state.histories[screenId].past.push(cmd);
    });
  },
  undo: () => {
    const { screenSet, activeScreenIndex, histories } = get();
    if (!screenSet || activeScreenIndex === null) return;
    const screenId =  screenSet.screens[activeScreenIndex].id;
    const history = histories[screenId];
    if (history) {
      const cmd = history.past.pop();
      if (cmd) {
        set((state) => {
          cmd.undo(state);

          while (state.histories[screenId].future.length > HISTORY_LIMIT) {
            state.histories[screenId].future.shift();
          }
          state.histories[screenId].future.push(cmd);
        });
      }
    }
  },
  redo: () => {
    const { screenSet, activeScreenIndex, histories } = get();
    if (!screenSet || activeScreenIndex === null) return;
    const screenId =  screenSet.screens[activeScreenIndex].id;
    const history = histories[screenId];
    if (history) {
      const cmd = history.future.pop();
      if (cmd) {
        set((state) => {
          cmd.do(state);

          while (state.histories[screenId].past.length > HISTORY_LIMIT) {
            state.histories[screenId].past.shift();
          }
          state.histories[screenId].past.push(cmd);
        });
      }
    }
  },

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
