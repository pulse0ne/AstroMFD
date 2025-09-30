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
  histories: new Map(),

  // mutators
  addCommand: (cmd: UndoableCommand) => {
    set((state ) => {
      if (!state.screenSet || state.activeScreenIndex === null) return;
      const screenId = state.screenSet.screens[state.activeScreenIndex].id;
      if (!state.histories.get(screenId)) {
        // state.histories.get(screenId) = createHistory();
        state.histories.set(screenId, createHistory());
      }
      while (state.histories.get(screenId)!.past.length > HISTORY_LIMIT) {
        state.histories.get(screenId)!.past.shift();
      }
      state.histories.get(screenId)!.past.push(cmd);
    });
    // console.log(get().histories);
  },
  undo: () => {
    const { screenSet, activeScreenIndex, histories } = get();
    if (!screenSet || activeScreenIndex === null) return;
    const screenId =  screenSet.screens[activeScreenIndex].id;
    const history = histories.get(screenId);
    if (history) {
      const cmd = history.past.pop();
      if (cmd) {
        set((state) => {
          cmd.undo(state);

          while (state.histories.get(screenId)!.future.length > HISTORY_LIMIT) {
            state.histories.get(screenId)!.future.shift();
          }
          state.histories.get(screenId)!.future.push(cmd);
        });
      }
    }
  },
  redo: () => {
    const { screenSet, activeScreenIndex, histories } = get();
    if (!screenSet || activeScreenIndex === null) return;
    const screenId =  screenSet.screens[activeScreenIndex].id;
    const history = histories.get(screenId);
    if (history) {
      const cmd = history.future.pop();
      if (cmd) {
        set((state) => {
          cmd.do(state);

          while (state.histories.get(screenId)!.past.length > HISTORY_LIMIT) {
            state.histories.get(screenId)!.past.shift();
          }
          state.histories.get(screenId)!.past.push(cmd);
        });
      }
    }
  },
});
