import {StateCreator} from "zustand/vanilla";
import {RootState, WidgetSlice} from "./types.ts";
import {UndoableCommand} from "./command.ts";
import {fastCopy} from "../utils/fastCopy.ts";
import {Widget} from "@common/shared/models";

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
      const screen = state.screenSet!.screens.find(s => s.id === screenId);
      if (!screen) return;

      const widgetIndex = screen.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex < 0) return;

      screen.widgets.splice(widgetIndex, 1, widget);
    },
    undo: (state) => {
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
      const screen = state.screenSet!.screens.find(i => i.id === screenId);
      if (!screen) return;

      const widgetIndex = screen.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex < 0) return;

      screen.widgets.splice(widgetIndex, 1);
      state.activeWidgetIndex = null;
    },
    undo: (state) => {
      const screen = state.screenSet!.screens.find(s => s.id === screenId);
      if (!screen) return;

      const insertAt = Math.max(0, Math.min(originalWidgetIndex, screen.widgets.length));
      screen.widgets.splice(insertAt, 0, originalWidget);
    }
  };
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
      console.log(widgetId, from, to, screenIndex);
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
    const state = get();
    if (!canModifyWidget(state)) return;
    const screen = state.screenSet!.screens[state.activeScreenIndex];
    const from = state.activeWidgetIndex;
    const to = from + 1;
    if (to >= screen.widgets.length) return;

    const cmd = makeReorderWidgetCommand(screen.widgets[from].id, from, to, state.activeScreenIndex);
    state.executeCommand(cmd);
  },
  sendBackward: () => {
    const state = get();
    if (!canModifyWidget(state)) return;
    const screen = state.screenSet!.screens[state.activeScreenIndex];
    const from = state.activeWidgetIndex;
    const to = from - 1;
    if (to < 0) return;
    console.log(from, to);

    const cmd = makeReorderWidgetCommand(screen.widgets[from].id, from, to, state.activeScreenIndex);
    state.executeCommand(cmd);
  },
  sendToFront: () => {
    const state = get();
    if (!canModifyWidget(state)) return;
    const screen = state.screenSet!.screens[state.activeScreenIndex];
    const from = state.activeWidgetIndex;
    const to = screen.widgets.length - 1;
    if (from === to) return;

    const cmd = makeReorderWidgetCommand(screen.widgets[from].id, from, to, state.activeScreenIndex);
    state.executeCommand(cmd);
  },
  sendToBack: () => {
    const state = get();
    if (!canModifyWidget(state)) return;
    const screen = state.screenSet!.screens[state.activeScreenIndex];
    const from = state.activeWidgetIndex;
    const to = 0;
    if (from === to) return;

    const cmd = makeReorderWidgetCommand(screen.widgets[from].id, from, to, state.activeScreenIndex);
    state.executeCommand(cmd);
  },
});
