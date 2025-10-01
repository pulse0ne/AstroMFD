import {StateCreator} from "zustand/vanilla";
import {RootState, WidgetSlice} from "./types.ts";
import {Widget} from "../types/widget.ts";
import {UndoableCommand} from "./command.ts";
import {fastCopy} from "../utils/fastCopy.ts";

function canModifyWidget(state: RootState): state is RootState & {
  screenSet: NonNullable<RootState["screenSet"]>;
  activeScreenIndex: number;
  activeWidgetIndex: number;
} {
  return !!state.screenSet && state.activeScreenIndex !== null && state.activeWidgetIndex !== null;
}

function makeCommand(command: string, widget: Widget, originalWidget: Widget, screenIndex: number, widgetIndex: number): UndoableCommand {
  return {
    type: command,
    do: (state) => {
      state.screenSet!.screens[screenIndex].widgets[widgetIndex] = widget;
    },
    undo: (state) => {
      state.screenSet!.screens[screenIndex].widgets[widgetIndex] = originalWidget;
    }
  };
}

function makeDeleteWidgetCommand(widget: Widget, screenIndex: number, widgetIndex: number): UndoableCommand {
  const originalWidget = fastCopy(widget);
  return {
    type: "widget.delete",
    do: (state) => {
      state.screenSet!.screens[screenIndex].widgets.splice(widgetIndex, 1);
    },
    undo: (state) => {
      state.screenSet!.screens[screenIndex].widgets.splice(widgetIndex, 0, originalWidget);
    }
  };
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
  updateWidget: (widget: Widget, changeType: string) => {
    const state = get();
    if (canModifyWidget(state)) {
      const originalWidget = fastCopy(state.screenSet.screens[state.activeScreenIndex].widgets[state.activeWidgetIndex]);
      const cmd = makeCommand(
        changeType,
        widget,
        originalWidget,
        state.activeScreenIndex,
        state.activeWidgetIndex
      );
      state.executeCommand(cmd);
    }
  },
  nudge: (byX, byY) => {
    const state = get();
    if (canModifyWidget(state)) {
      const originalWidget = fastCopy(state.screenSet.screens[state.activeScreenIndex].widgets[state.activeWidgetIndex]);
      const copy = fastCopy(originalWidget);
      copy.shape.position = { x: copy.shape.position.x + byX, y: copy.shape.position.y + byY };
      const cmd = makeCommand(
        "widget.shape.position",
        copy,
        originalWidget,
        state.activeScreenIndex,
        state.activeWidgetIndex
      );
      state.executeCommand(cmd);
    }
  },
  deleteActiveWidget: () => {
    const state = get();
    if (canModifyWidget(state)) {
      const widget = fastCopy(state.screenSet.screens[state.activeScreenIndex].widgets[state.activeWidgetIndex]);
      const cmd = makeDeleteWidgetCommand(
        widget,
        state.activeScreenIndex,
        state.activeWidgetIndex
      );
      state.executeCommand(cmd);
      set(state => {
        state.activeWidgetIndex = null;
      });
    }
  },

  // accessors
  getActiveWidget: () => {
    const { activeScreenIndex, activeWidgetIndex, screenSet } = get();
    if (activeScreenIndex === null || activeWidgetIndex === null) return null;
    return screenSet?.screens[activeScreenIndex]?.widgets[activeWidgetIndex] ?? null;
  },
});
