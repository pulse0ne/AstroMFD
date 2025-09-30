import {StateCreator} from "zustand/vanilla";
import {RootState, WidgetSlice} from "./types.ts";
import {Widget} from "../types/widget.ts";
import { Draft } from "immer";
import {UndoableCommand} from "./command.ts";
import {fastCopy} from "../utils/fastCopy.ts";

function canModifyWidget(state: Draft<RootState>): state is Draft<RootState> & {
  screenSet: NonNullable<RootState["screenSet"]>;
  activeScreenIndex: number;
  activeWidgetIndex: number;
} {
  return !!state.screenSet && state.activeScreenIndex !== null && state.activeWidgetIndex !== null;
}

function makeCommand(command: string, widget: Widget, state: Draft<RootState>, screenIndex: number, widgetIndex: number): UndoableCommand {
  const originalWidget = fastCopy(state.screenSet!.screens[screenIndex].widgets[widgetIndex]);
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
    set((state) => {
      if (canModifyWidget(state)) {
        const cmd = makeCommand(changeType, widget, state, state.activeScreenIndex, state.activeWidgetIndex);
        cmd.do(state);

        state.addCommand(cmd);
      }
    });
  },
  nudge: (byX, byY) => {
    set((state) => {
      if (canModifyWidget(state)) {
        const current = state.screenSet.screens[state.activeScreenIndex].widgets[state.activeScreenIndex].shape.position;
        const copy = fastCopy(state.screenSet.screens[state.activeScreenIndex].widgets[state.activeWidgetIndex]);
        copy.shape.position = { x: current.x + byX, y: current.y + byY };
        const cmd = makeCommand("widget.shape.position", copy, state, state.activeScreenIndex, state.activeWidgetIndex);
        cmd.do(state);

        state.addCommand(cmd);
      }
    });
  },
  deleteActiveWidget: () => {
    set((state) => {
      if (canModifyWidget(state)) {
        const widget = state.screenSet.screens[state.activeScreenIndex].widgets[state.activeWidgetIndex];
        const cmd = makeDeleteWidgetCommand(widget, state.activeScreenIndex, state.activeWidgetIndex);
        cmd.do(state);

        state.addCommand(cmd);
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
