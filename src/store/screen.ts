import {StateCreator} from "zustand/vanilla";
import {RootState, ScreenSlice} from "./types.ts";
import {Screen} from "@common/shared/models";


export const createScreenSlice: StateCreator<
  RootState,
  [["zustand/immer", never]],
  [],
  ScreenSlice
> = (set) => ({
  // state
  activeScreenIndex: null,

  // actions
  setActiveScreenIndex: (index: number) => {
    set((state) => {
      state.activeScreenIndex = index;
    });
  },
  unsetActiveScreenIndex: () => {
    set((state) => {
      state.activeScreenIndex = null;
    });
  },
  updateScreen: (screen: Screen) => {
    set((state) => {
      if (state.screenSet && state.activeScreenIndex !== null) {
        state.screenSet.screens[state.activeScreenIndex] = screen;
      }
    });
  },
});
