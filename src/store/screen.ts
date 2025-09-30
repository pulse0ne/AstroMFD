import {StateCreator} from "zustand/vanilla";
import {RootState, ScreenSlice} from "./types.ts";
import {Screen, Widget} from "../types/widget.ts";
import {Draft} from "immer";
import {UndoableCommand} from "./command.ts";

function canModifyWidget(state: Draft<RootState>): state is Draft<RootState> & {
  screenSet: NonNullable<RootState["screenSet"]>;
  activeScreenIndex: number;
  activeWidgetIndex: number;
} {
  return !!state.screenSet && state.activeScreenIndex !== null && state.activeWidgetIndex !== null;
}

function makeAddWidgetCommand(widget: Widget, screenIndex: number): UndoableCommand {
  const id = widget.id;
  return {
    type: "widget.add",
    do: (state) => {
      state.screenSet!.screens[screenIndex].widgets.push(widget);
    },
    undo: (state) => {
      state.screenSet!.screens[screenIndex].widgets = state.screenSet!.screens[screenIndex].widgets.filter(w => w.id !== id);
    }
  };
}

function moveWidget(state: Draft<RootState>, to: number) {
  // TODO: undo/redo commands
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
        // TODO: undo/redo command
        state.screenSet.screens[state.activeScreenIndex] = screen;
      }
    });
  },
  addWidget: (widget: Widget) => {
    set((state) => {
      if (state.screenSet && state.activeScreenIndex !== null) {
        const cmd = makeAddWidgetCommand(widget, state.activeScreenIndex);
        cmd.do(state);

        state.addCommand(cmd);

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
