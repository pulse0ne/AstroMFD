import { Widget } from "@common/shared/models";
import { Draft } from "immer";
import { v4 as uuid } from "uuid";
import { StateCreator } from "zustand/vanilla";

import { fastCopy } from "../utils/fastCopy.ts";
import { UndoableCommand } from "./command.ts";
import { RootState, WidgetSlice } from "./types.ts";

function canModifyWidget(state: RootState): state is RootState & {
  screenSet: NonNullable<RootState["screenSet"]>;
  activeScreenIndex: number;
  activeWidgetIndex: number;
} {
  return (
    !!state.screenSet &&
    state.activeScreenIndex !== null &&
    state.activeWidgetIndex !== null
  );
}

function getWidgetList(state: Draft<RootState>): Widget[] | null {
  if (!state.screenSet || state.activeScreenIndex === null) return null;
  const screen = state.screenSet.screens[state.activeScreenIndex];
  if (state.editingContainerId) {
    return getContainerWidgets(screen.widgets, state.editingContainerId);
  }
  return screen.widgets;
}

function getWidgetListFromState(state: RootState): Widget[] | null {
  if (!state.screenSet || state.activeScreenIndex === null) return null;
  const screen = state.screenSet.screens[state.activeScreenIndex];
  if (state.editingContainerId) {
    return getContainerWidgets(screen.widgets, state.editingContainerId);
  }
  return screen.widgets;
}

function makeCommand(
  command: string,
  widget: Widget,
  originalWidget: Widget,
  screenId: string,
  carouselId: string | null,
): UndoableCommand {
  const widgetId = widget.id;
  return {
    type: command,
    targetId: widgetId,
    do: (state) => {
      const screen = state.screenSet!.screens.find((s) => s.id === screenId);
      if (!screen) return;
      const widgets = carouselId
        ? getContainerWidgets(screen.widgets, carouselId)
        : screen.widgets;
      if (!widgets) return;
      const widgetIndex = widgets.findIndex((w) => w.id === widgetId);
      if (widgetIndex < 0) return;
      widgets.splice(widgetIndex, 1, widget);
    },
    undo: (state) => {
      const screen = state.screenSet!.screens.find((s) => s.id === screenId);
      if (!screen) return;
      const widgets = carouselId
        ? getContainerWidgets(screen.widgets, carouselId)
        : screen.widgets;
      if (!widgets) return;
      const widgetIndex = widgets.findIndex((w) => w.id === widgetId);
      if (widgetIndex < 0) return;
      widgets.splice(widgetIndex, 1, originalWidget);
    },
  };
}

function makeDeleteWidgetCommand(
  widget: Widget,
  screenId: string,
  originalWidgetIndex: number,
  carouselId: string | null,
): UndoableCommand {
  const originalWidget = fastCopy(widget);
  const widgetId = originalWidget.id;
  return {
    type: "widget.delete",
    targetId: widgetId,
    do: (state) => {
      const screen = state.screenSet!.screens.find((i) => i.id === screenId);
      if (!screen) return;
      const widgets = carouselId
        ? getContainerWidgets(screen.widgets, carouselId)
        : screen.widgets;
      if (!widgets) return;
      const widgetIndex = widgets.findIndex((w) => w.id === widgetId);
      if (widgetIndex < 0) return;
      widgets.splice(widgetIndex, 1);
      state.activeWidgetIndex = null;
    },
    undo: (state) => {
      const screen = state.screenSet!.screens.find((s) => s.id === screenId);
      if (!screen) return;
      const widgets = carouselId
        ? getContainerWidgets(screen.widgets, carouselId)
        : screen.widgets;
      if (!widgets) return;
      const insertAt = Math.max(
        0,
        Math.min(originalWidgetIndex, widgets.length),
      );
      widgets.splice(insertAt, 0, originalWidget);
    },
  };
}

function makeAddWidgetCommand(
  widget: Widget,
  screenIndex: number,
  carouselId: string | null,
): UndoableCommand {
  const id = widget.id;
  return {
    type: "widget.add",
    targetId: id,
    do: (state) => {
      const screen = state.screenSet!.screens[screenIndex];
      const widgets = carouselId
        ? getContainerWidgets(screen.widgets, carouselId)
        : screen.widgets;
      if (!widgets) return;
      widgets.push(widget);
    },
    undo: (state) => {
      const screen = state.screenSet!.screens[screenIndex];
      const widgets = carouselId
        ? getContainerWidgets(screen.widgets, carouselId)
        : screen.widgets;
      if (!widgets) return;
      const idx = widgets.findIndex((w) => w.id === id);
      if (idx >= 0) widgets.splice(idx, 1);
    },
  };
}

function makeReorderWidgetCommand(
  widgetId: string,
  from: number,
  to: number,
  screenIndex: number,
  carouselId: string | null,
): UndoableCommand {
  return {
    type: "widget.reorder",
    targetId: widgetId,
    do: (state) => {
      const screen = state.screenSet!.screens[screenIndex];
      const widgets = carouselId
        ? getContainerWidgets(screen.widgets, carouselId)
        : screen.widgets;
      if (!widgets) return;
      const currentIndex = widgets.findIndex((w) => w.id === widgetId);
      if (currentIndex < 0) return;
      const [widget] = widgets.splice(currentIndex, 1);
      widgets.splice(to, 0, widget);
      state.activeWidgetIndex = to;
    },
    undo: (state) => {
      const screen = state.screenSet!.screens[screenIndex];
      const widgets = carouselId
        ? getContainerWidgets(screen.widgets, carouselId)
        : screen.widgets;
      if (!widgets) return;
      const currentIndex = widgets.findIndex((w) => w.id === widgetId);
      if (currentIndex < 0) return;
      const [widget] = widgets.splice(currentIndex, 1);
      widgets.splice(from, 0, widget);
      state.activeWidgetIndex = from;
    },
  };
}

function getContainerWidgets(
  screenWidgets: Widget[],
  containerId: string,
): Widget[] | null {
  const container = screenWidgets.find((w) => w.id === containerId);
  if (!container) return null;
  if (container.type === "carousel") {
    return container.pages[container.activePageIndex]?.widgets ?? null;
  }
  if (container.type === "panel") {
    return container.widgets;
  }
  return null;
}

export const createWidgetSlice: StateCreator<
  RootState,
  [["zustand/immer", never]],
  [],
  WidgetSlice
> = (set, get) => ({
  // state
  activeWidgetIndex: null,
  editingContainerId: null,

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
      const widgets = getWidgetListFromState(state);
      if (!widgets) return;
      const originalWidget = fastCopy(widgets[state.activeWidgetIndex]);
      const cmd = makeCommand(
        changeType,
        widget,
        originalWidget,
        screen.id,
        state.editingContainerId,
      );
      state.executeCommand(cmd);
    }
  },
  nudge: (byX, byY) => {
    const state = get();
    if (canModifyWidget(state)) {
      const screen = state.screenSet.screens[state.activeScreenIndex];
      const widgets = getWidgetListFromState(state);
      if (!widgets) return;
      const originalWidget = fastCopy(widgets[state.activeWidgetIndex]);
      const copy = fastCopy(originalWidget);
      copy.shape.position = {
        x: copy.shape.position.x + byX,
        y: copy.shape.position.y + byY,
      };
      const cmd = makeCommand(
        "widget.shape.position",
        copy,
        originalWidget,
        screen.id,
        state.editingContainerId,
      );
      state.executeCommand(cmd);
    }
  },
  deleteActiveWidget: () => {
    const state = get();
    if (canModifyWidget(state)) {
      const screen = state.screenSet.screens[state.activeScreenIndex];
      const widgets = getWidgetListFromState(state);
      if (!widgets) return;
      const widget = fastCopy(widgets[state.activeWidgetIndex]);
      const cmd = makeDeleteWidgetCommand(
        widget,
        screen.id,
        state.activeWidgetIndex,
        state.editingContainerId,
      );
      state.executeCommand(cmd);
      set((state) => {
        state.activeWidgetIndex = null;
      });
    }
  },
  duplicateActiveWidget: () => {
    const state = get();
    if (canModifyWidget(state)) {
      const widgets = getWidgetListFromState(state);
      if (!widgets) return;
      const widget = fastCopy(widgets[state.activeWidgetIndex]);
      widget.id = uuid();
      widget.shape.position = {
        x: widget.shape.position.x + 20,
        y: widget.shape.position.y + 20,
      };
      const cmd = makeAddWidgetCommand(
        widget,
        state.activeScreenIndex,
        state.editingContainerId,
      );
      state.executeCommand(cmd);
      set((state) => {
        const ws = getWidgetList(state);
        state.activeWidgetIndex = ws ? ws.length - 1 : null;
      });
    }
  },
  addWidget: (widget: Widget) => {
    const state = get();
    if (state.screenSet && state.activeScreenIndex !== null) {
      const cmd = makeAddWidgetCommand(
        widget,
        state.activeScreenIndex,
        state.editingContainerId,
      );
      state.executeCommand(cmd);
      set((state) => {
        const ws = getWidgetList(state);
        state.activeWidgetIndex = ws ? ws.length - 1 : null;
      });
    }
  },
  sendForward: () => {
    const state = get();
    if (!canModifyWidget(state)) return;
    const widgets = getWidgetListFromState(state);
    if (!widgets) return;
    const from = state.activeWidgetIndex;
    const to = from + 1;
    if (to >= widgets.length) return;
    const cmd = makeReorderWidgetCommand(
      widgets[from].id,
      from,
      to,
      state.activeScreenIndex,
      state.editingContainerId,
    );
    state.executeCommand(cmd);
  },
  sendBackward: () => {
    const state = get();
    if (!canModifyWidget(state)) return;
    const widgets = getWidgetListFromState(state);
    if (!widgets) return;
    const from = state.activeWidgetIndex;
    const to = from - 1;
    if (to < 0) return;
    const cmd = makeReorderWidgetCommand(
      widgets[from].id,
      from,
      to,
      state.activeScreenIndex,
      state.editingContainerId,
    );
    state.executeCommand(cmd);
  },
  sendToFront: () => {
    const state = get();
    if (!canModifyWidget(state)) return;
    const widgets = getWidgetListFromState(state);
    if (!widgets) return;
    const from = state.activeWidgetIndex;
    const to = widgets.length - 1;
    if (from === to) return;
    const cmd = makeReorderWidgetCommand(
      widgets[from].id,
      from,
      to,
      state.activeScreenIndex,
      state.editingContainerId,
    );
    state.executeCommand(cmd);
  },
  sendToBack: () => {
    const state = get();
    if (!canModifyWidget(state)) return;
    const widgets = getWidgetListFromState(state);
    if (!widgets) return;
    const from = state.activeWidgetIndex;
    const to = 0;
    if (from === to) return;
    const cmd = makeReorderWidgetCommand(
      widgets[from].id,
      from,
      to,
      state.activeScreenIndex,
      state.editingContainerId,
    );
    state.executeCommand(cmd);
  },
  enterContainer: (id: string) => {
    set((state) => {
      state.editingContainerId = id;
      state.activeWidgetIndex = null;
    });
  },
  exitContainer: () => {
    set((state) => {
      state.editingContainerId = null;
      state.activeWidgetIndex = null;
    });
  },
});
