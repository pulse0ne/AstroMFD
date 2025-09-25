import {StateCreator} from "zustand/vanilla";
import {RootState, ScreenSlice} from "./types.ts";
import {Screen, Widget} from "../types/widget.ts";

export const createScreenSlice: StateCreator<
  RootState,
  [["zustand/immer", never]],
  [],
  ScreenSlice
> = (set, get) => ({
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
  addWidget: (widget: Widget) => {
    set((state) => {
      console.log("here", state);
      if (state.screenSet && state.activeScreenIndex !== null) {
        console.log("2");
        state.screenSet.screens[state.activeScreenIndex].widgets.push(widget);
        state.activeWidgetIndex = state.screenSet.screens[state.activeScreenIndex].widgets.length - 1;
      }
    });
  },
  deleteWidget: (id: string) => {
    set((state) => {
      if (state.screenSet && state.activeScreenIndex !== null) {
        state.screenSet.screens[state.activeScreenIndex].widgets = state.screenSet.screens[state.activeScreenIndex].widgets.filter(w => w.id !== id);
        state.activeWidgetIndex = null;
      }
    });
  },

  // accessors
  getActiveScreen: () => {
    const { activeScreenIndex, screenSet } = get();
    if (activeScreenIndex === null) return null;
    return screenSet?.screens[activeScreenIndex] ?? null;
  },
});
