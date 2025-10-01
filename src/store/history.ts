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
> = (set) => ({
  // state
  histories: new Map(),

  // mutators
  executeCommand: (cmd: UndoableCommand) => {
    set((state ) => {
      if (!state.screenSet || state.activeScreenIndex === null) return;
      const screenId = state.screenSet.screens[state.activeScreenIndex].id;

      const histories = new Map(state.histories);
      let history = histories.get(screenId);
      if (!history) {
        history = createHistory();
        histories.set(screenId, history);
      }
      while (histories.get(screenId)!.past.length > HISTORY_LIMIT) {
        history.past.shift();
      }
      history.past.push(cmd);
      history.future = [];

      cmd.do(state);

      state.histories = histories;
    });
  },
  undo: () => {
    set(state => {
      if (!state.screenSet || state.activeScreenIndex === null) return;
      const screenId = state.screenSet.screens[state.activeScreenIndex].id;
      const history = state.histories.get(screenId);
      if (!history || history.past.length === 0) return;

      const lastIndex = history.past.length - 1;
      const cmd = history.past[lastIndex];

      history.past = history.past.slice(0, lastIndex);

      cmd.undo(state);

      history.future = [...history.future, cmd];
    });
  },
  redo: () => {
    set(state => {
      if (!state.screenSet || state.activeScreenIndex === null) return;
      const screenId = state.screenSet.screens[state.activeScreenIndex].id;
      const history = state.histories.get(screenId);
      if (!history || history.future.length === 0) return;

      const lastIndex = history.future.length - 1;
      const cmd = history.future[lastIndex];

      history.future = history.future.slice(0, lastIndex);

      cmd.undo(state);

      history.past = [...history.past, cmd];
    });
  },
});
