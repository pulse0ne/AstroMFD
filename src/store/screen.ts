import {StateCreator} from "zustand/vanilla";
import {RootState, ScreenSlice} from "./types.ts";
import {Screen, Widget} from "../types/widget.ts";
import {Draft} from "immer";

function canModifyWidget(state: Draft<RootState>): state is Draft<RootState> & {
  screenSet: NonNullable<RootState["screenSet"]>;
  activeScreenIndex: number;
  activeWidgetIndex: number;
} {
  return !!state.screenSet && state.activeScreenIndex !== null && state.activeWidgetIndex !== null;
}

function moveWidget(state: Draft<RootState>, to: number) {
  if (!canModifyWidget(state)) return;
  const widgets = state.screenSet.screens[state.activeScreenIndex].widgets;
  if (to < 0 || to >= widgets.length) return;

  const [widget] = widgets.splice(state.activeWidgetIndex, 1);
  widgets.splice(to, 0, widget);

  state.activeWidgetIndex = to;
}

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
  sendForward: () => {
    set((state) => {
      if (!canModifyWidget(state)) return;
      moveWidget(state, state.activeWidgetIndex + 1);
    });
  },
  sendBackward: () => {
    set(state => {
      if (!canModifyWidget(state)) return;
      moveWidget(state, state.activeWidgetIndex - 1);
    });
  },
  sendToFront: () => {
    set(state => {
      if (!canModifyWidget(state)) return;
      moveWidget(state, state.screenSet.screens[state.activeScreenIndex].widgets.length - 1);
    });
  },
  sendToBack: () => {
    set(state => {
      if (!canModifyWidget(state)) return;
      moveWidget(state, 0);
    });
  },

  // accessors
  getActiveScreen: () => {
    const { activeScreenIndex, screenSet } = get();
    if (activeScreenIndex === null) return null;
    return screenSet?.screens[activeScreenIndex] ?? null;
  },
});
