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

function makeCommand(command: string, widget: Widget, originalWidget: Widget, screenId: string): UndoableCommand {
  const widgetId = widget.id;
  return {
    type: command,
    targetId: widgetId,
    do: (state) => {
      // state.screenSet!.screens[screenIndex].widgets[widgetIndex] = widget;
      const screen = state.screenSet!.screens.find(s => s.id === screenId);
      if (!screen) return;

      const widgetIndex = screen.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex < 0) return;

      screen.widgets.splice(widgetIndex, 1, widget);
    },
    undo: (state) => {
      // state.screenSet!.screens[screenIndex].widgets[widgetIndex] = originalWidget;
      const screen = state.screenSet!.screens.find(s => s.id === screenId);
      if (!screen) return;

      const widgetIndex = screen.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex < 0) return;

      screen.widgets.splice(widgetIndex, 1, originalWidget);
    }
  };
}

function makeDeleteWidgetCommand(widget: Widget, screenId: string, originalWidgetIndex: number): UndoableCommand {
  const originalWidget = fastCopy(widget);
  const widgetId = originalWidget.id;
  return {
    type: "widget.delete",
    targetId: widgetId,
    do: (state) => {
      // state.screenSet!.screens[screenIndex].widgets.splice(widgetIndex, 1);
      const screen = state.screenSet!.screens.find(i => i.id === screenId);
      if (!screen) return;

      const widgetIndex = screen.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex < 0) return;

      screen.widgets.splice(widgetIndex, 1);
      state.activeWidgetIndex = null;
    },
    undo: (state) => {
      // state.screenSet!.screens[screenIndex].widgets.splice(widgetIndex, 0, originalWidget);
      const screen = state.screenSet!.screens.find(s => s.id === screenId);
      if (!screen) return;

      const insertAt = Math.max(0, Math.min(originalWidgetIndex, screen.widgets.length));
      screen.widgets.splice(insertAt, 0, originalWidget);
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
      const screen = state.screenSet.screens[state.activeScreenIndex];
      const originalWidget = fastCopy(screen.widgets[state.activeWidgetIndex]);
      const cmd = makeCommand(
        changeType,
        widget,
        originalWidget,
        screen.id
      );
      state.executeCommand(cmd);
    }
  },
  nudge: (byX, byY) => {
    const state = get();
    if (canModifyWidget(state)) {
      const screen = state.screenSet.screens[state.activeScreenIndex];
      const originalWidget = fastCopy(screen.widgets[state.activeWidgetIndex]);
      const copy = fastCopy(originalWidget);
      copy.shape.position = { x: copy.shape.position.x + byX, y: copy.shape.position.y + byY };
      const cmd = makeCommand(
        "widget.shape.position",
        copy,
        originalWidget,
        screen.id
      );
      state.executeCommand(cmd);
    }
  },
  deleteActiveWidget: () => {
    const state = get();
    if (canModifyWidget(state)) {
      const screen = state.screenSet.screens[state.activeScreenIndex];
      const widget = fastCopy(screen.widgets[state.activeWidgetIndex]);
      const cmd = makeDeleteWidgetCommand(
        widget,
        screen.id,
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
