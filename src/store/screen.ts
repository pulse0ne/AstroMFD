import {StateCreator} from "zustand/vanilla";
import {RootState, ScreenSlice} from "./types.ts";
import {Screen, Widget} from "../types/widget.ts";
import {UndoableCommand} from "./command.ts";

function canModifyWidget(state: RootState): state is RootState & {
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
    targetId: id,
    do: (state) => {
      state.screenSet!.screens[screenIndex].widgets.push(widget);
    },
    undo: (state) => {
      state.screenSet!.screens[screenIndex].widgets = state.screenSet!.screens[screenIndex].widgets.filter(w => w.id !== id);
    }
  };
}

function makeReorderWidgetCommand(widgetId: string, from: number, to: number, screenIndex: number): UndoableCommand {
  return {
    type: "widget.reorder",
    targetId: widgetId,
    do: (state) => {
      const widgets = state.screenSet!.screens[screenIndex].widgets;
      const currentIndex = widgets.findIndex(w => w.id === widgetId);
      if (currentIndex < 0) return;
      const [widget] = widgets.splice(currentIndex, 1);
      widgets.splice(to, 0, widget);
      state.activeWidgetIndex = to;
    },
    undo: (state) => {
      const widgets = state.screenSet!.screens[screenIndex].widgets;
      const currentIndex = widgets.findIndex(w => w.id === widgetId);
      if (currentIndex < 0) return;
      const [widget] = widgets.splice(currentIndex, 1);
      widgets.splice(from, 0, widget);
      state.activeWidgetIndex = from;
    }
  };
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
    const state = get();
    if (state.screenSet && state.activeScreenIndex !== null) {
      const cmd = makeAddWidgetCommand(
        widget,
        state.activeScreenIndex,
      );
      state.executeCommand(cmd);

      set(state => {
        state.activeWidgetIndex = state.screenSet!.screens[state.activeScreenIndex!].widgets.length - 1;
      });
    }
  },
  sendForward: () => {
    set((state) => {
      if (!canModifyWidget(state)) return;
      const screen = state.screenSet!.screens[state.activeScreenIndex];
      const from = state.activeWidgetIndex;
      const to = from + 1;
      if (to >= screen.widgets.length) return;

      const cmd = makeReorderWidgetCommand(screen.widgets[from].id, from, to, state.activeScreenIndex);
      state.executeCommand(cmd);
    });
  },
  sendBackward: () => {
    set(state => {
      if (!canModifyWidget(state)) return;
      const screen = state.screenSet!.screens[state.activeScreenIndex];
      const from = state.activeWidgetIndex;
      const to = from - 1;
      if (to >= screen.widgets.length) return;

      const cmd = makeReorderWidgetCommand(screen.widgets[from].id, from, to, state.activeScreenIndex);
      state.executeCommand(cmd);
    });
  },
  sendToFront: () => {
    set(state => {
      if (!canModifyWidget(state)) return;
      const screen = state.screenSet!.screens[state.activeScreenIndex];
      const from = state.activeWidgetIndex;
      const to = screen.widgets.length - 1;
      if (to >= screen.widgets.length) return;

      const cmd = makeReorderWidgetCommand(screen.widgets[from].id, from, to, state.activeScreenIndex);
      state.executeCommand(cmd);
    });
  },
  sendToBack: () => {
    set(state => {
      if (!canModifyWidget(state)) return;
      const screen = state.screenSet!.screens[state.activeScreenIndex];
      const from = state.activeWidgetIndex;
      const to = 0;
      if (to >= screen.widgets.length) return;

      const cmd = makeReorderWidgetCommand(screen.widgets[from].id, from, to, state.activeScreenIndex);
      state.executeCommand(cmd);
    });
  },

  // accessors
  getActiveScreen: () => {
    const { activeScreenIndex, screenSet } = get();
    if (activeScreenIndex === null) return null;
    return screenSet?.screens[activeScreenIndex] ?? null;
  },
});
