import {RootState, ScreenSetSlice} from "./types.ts";
import {StateCreator} from "zustand/vanilla";
import {Screen} from "../types/widget.ts";

export const createScreenSetSlice: StateCreator<
  RootState,
  [["zustand/immer", never]],
  [],
  ScreenSetSlice
> = (set) => ({
  // state
  screenSet: null,

  // mutators
  setActiveScreenSet: (screenSet) => {
    set((state) => {
      state.screenSet = screenSet;
      if (screenSet.screens.length) {
        state.activeScreenIndex = screenSet.screens.length - 1;
      }
    });
  },
  unsetActiveScreenSet: () => {
    set((state) => {
      state.screenSet = null;
    });
  },
  updateSize: (size) => {
    // TODO: undo/redo
    set((state) => {
      if (state.screenSet) {
        state.screenSet.size = size;
      }
    });
  },
  addScreen: (screen: Screen) => {
    set((state) => {
      if (state.screenSet) {
        state.screenSet.screens.push(screen);
        state.activeScreenIndex = state.screenSet.screens.length - 1;
      }
    });
  },
  deleteScreen: (id: string) => {
    set((state) => {
      // TODO: undo/redo
      // TODO: remove history for screen? maybe not so we have it in case the screen deletion gets undone
      if (state.screenSet) {
        state.screenSet.screens = state.screenSet.screens.filter(s => s.id !== id);
        state.activeScreenIndex = null;
      }
    });
  },
});
