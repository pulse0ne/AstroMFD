import { Screen } from "@common/shared/models";
import { StateCreator } from "zustand/vanilla";

import { RootState, ScreenSetSlice } from "./types.ts";

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
        state.activeScreenIndex = 0;
      }
    });
  },
  unsetActiveScreenSet: () => {
    set((state) => {
      state.screenSet = null;
    });
  },
  updateSize: (size) => {
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
      if (state.screenSet) {
        const oldIndex = state.screenSet.screens.findIndex((s) => s.id === id);
        state.screenSet.screens = state.screenSet.screens.filter(
          (s) => s.id !== id,
        );
        if (state.screenSet.screens.length === 0) {
          state.activeScreenIndex = null;
        } else {
          state.activeScreenIndex = Math.min(
            oldIndex,
            state.screenSet.screens.length - 1,
          );
        }
        state.activeWidgetIndex = null;
        state.selectedWidgetIndices = new Set();
        state.editingContainerId = null;
        const histories = state.histories;
        if (histories.get(id)) {
          histories.delete(id);
          state.histories = histories;
        }
      }
    });
  },
});
