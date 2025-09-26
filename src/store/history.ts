import {StateCreator} from "zustand/vanilla";
import {HistorySlice, RootState} from "./types.ts";

export type Command = {
  type: string;

};

export type History = {
  // past:
};

export function createHistory(): History {
  return {};
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
    // TODO
    return false;
  },
  hasRedos: () => {
    // TODO
    return false;
  },
});
