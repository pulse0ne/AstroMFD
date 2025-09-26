import {StateCreator} from "zustand/vanilla";
import {RootState, WidgetSlice} from "./types.ts";
import {Widget} from "../types/widget.ts";
import { Draft } from "immer";

function canModifyWidget(state: Draft<RootState>): state is Draft<RootState> & {
  screenSet: NonNullable<RootState["screenSet"]>;
  activeScreenIndex: number;
  activeWidgetIndex: number;
} {
  return !!state.screenSet && state.activeScreenIndex !== null && state.activeWidgetIndex !== null;
}

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
      if (canModifyWidget(state)) {
        state.screenSet.screens[state.activeScreenIndex].widgets[state.activeWidgetIndex] = widget;
      }
    });
  },
  nudge: (byX, byY) => {
    set((state) => {
      if (canModifyWidget(state)) {
        const current = state.screenSet.screens[state.activeScreenIndex].widgets[state.activeScreenIndex].shape.position;
        state.screenSet.screens[state.activeScreenIndex].widgets[state.activeScreenIndex].shape.position = { x: current.x + byX, y: current.y + byY };
      }
    });
  },
  deleteActiveWidget: () => {
    set((state) => {
      if (canModifyWidget(state)) {
        state.screenSet.screens[state.activeScreenIndex].widgets.splice(state.activeWidgetIndex, 1);
      }
      state.activeWidgetIndex = null;
    });
  },

  // accessors
  getActiveWidget: () => {
    const { activeScreenIndex, activeWidgetIndex, screenSet } = get();
    if (activeScreenIndex === null || activeWidgetIndex === null) return null;
    return screenSet?.screens[activeScreenIndex]?.widgets[activeWidgetIndex] ?? null;
  },
});