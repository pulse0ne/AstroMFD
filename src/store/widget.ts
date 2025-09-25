import {StateCreator} from "zustand/vanilla";
import {RootState, WidgetSlice} from "./types.ts";
import {Widget} from "../types/widget.ts";

export const createWidgetSlice: StateCreator<
  RootState,
  [["zustand/immer", never]],
  [],
  WidgetSlice
> = (set, get) => ({
  // state
  activeWidgetIndex: null,

  // mutators
  setActiveWidgetIndex: (index: number) => {
    set((state) => {
      state.activeWidgetIndex = index;
    });
  },
  unsetActiveWidgetIndex: () => {
    set((state) => {
      state.activeWidgetIndex = null;
    });
  },
  updateWidget: (widget: Widget) => {
    set((state) => {
      if (state.screenSet && state.activeScreenIndex !== null && state.activeWidgetIndex !== null) {
        state.screenSet.screens[state.activeScreenIndex].widgets[state.activeWidgetIndex] = widget;
      }
    });
  },

  // accessors
  getActiveWidget: () => {
    const { activeScreenIndex, activeWidgetIndex, screenSet } = get();
    if (activeScreenIndex === null || activeWidgetIndex === null) return null;
    return screenSet?.screens[activeScreenIndex]?.widgets[activeWidgetIndex] ?? null;
  },
});