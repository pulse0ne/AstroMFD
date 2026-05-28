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
      state.selectedWidgetIndices = new Set([to]);
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
      state.selectedWidgetIndices = new Set([from]);
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
  selectedWidgetIndices: new Set(),
  editingContainerId: null,

  // mutators
  setActiveWidgetIndex: (index: number) => {
    set((state) => {
      state.activeWidgetIndex = index;
      state.selectedWidgetIndices = new Set([index]);
    });
  },
  toggleWidgetIndex: (index: number) => {
    set((state) => {
      const next = new Set(state.selectedWidgetIndices);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      state.selectedWidgetIndices = next;
      if (next.size === 1) {
        state.activeWidgetIndex = next.values().next().value!;
      } else {
        state.activeWidgetIndex = null;
      }
    });
  },
  unsetActiveWidgetIndex: () => {
    set((state) => {
      state.activeWidgetIndex = null;
      state.selectedWidgetIndices = new Set();
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
    if (!state.screenSet || state.activeScreenIndex === null) return;
    const widgets = getWidgetListFromState(state);
    if (!widgets) return;
    const screen = state.screenSet.screens[state.activeScreenIndex];
    const indices = state.selectedWidgetIndices.size > 0
      ? [...state.selectedWidgetIndices]
      : state.activeWidgetIndex !== null ? [state.activeWidgetIndex] : [];
    if (indices.length === 0) return;

    const originals = indices.map((i) => fastCopy(widgets[i]));
    const updated = originals.map((w) => {
      const copy = fastCopy(w);
      copy.shape.position = {
        x: copy.shape.position.x + byX,
        y: copy.shape.position.y + byY,
      };
      return copy;
    });

    const carouselId = state.editingContainerId;
    const screenId = screen.id;
    const cmd: UndoableCommand = {
      type: "widget.shape.position",
      targetId: updated[0].id,
      do: (state) => {
        const scr = state.screenSet!.screens.find((s) => s.id === screenId);
        if (!scr) return;
        const ws = carouselId ? getContainerWidgets(scr.widgets, carouselId) : scr.widgets;
        if (!ws) return;
        for (const u of updated) {
          const idx = ws.findIndex((w) => w.id === u.id);
          if (idx >= 0) ws.splice(idx, 1, u);
        }
      },
      undo: (state) => {
        const scr = state.screenSet!.screens.find((s) => s.id === screenId);
        if (!scr) return;
        const ws = carouselId ? getContainerWidgets(scr.widgets, carouselId) : scr.widgets;
        if (!ws) return;
        for (const o of originals) {
          const idx = ws.findIndex((w) => w.id === o.id);
          if (idx >= 0) ws.splice(idx, 1, o);
        }
      },
    };
    state.executeCommand(cmd);
  },
  deleteActiveWidget: () => {
    const state = get();
    if (!state.screenSet || state.activeScreenIndex === null) return;
    const widgets = getWidgetListFromState(state);
    if (!widgets) return;
    const screen = state.screenSet.screens[state.activeScreenIndex];

    const indices = state.selectedWidgetIndices.size > 0
      ? [...state.selectedWidgetIndices].sort((a, b) => b - a)
      : state.activeWidgetIndex !== null ? [state.activeWidgetIndex] : [];
    if (indices.length === 0) return;

    const deletedWidgets = indices.map((i) => ({ index: i, widget: fastCopy(widgets[i]) }));
    const carouselId = state.editingContainerId;
    const screenId = screen.id;

    const cmd: UndoableCommand = {
      type: "widget.delete",
      targetId: deletedWidgets[0].widget.id,
      do: (state) => {
        const scr = state.screenSet!.screens.find((s) => s.id === screenId);
        if (!scr) return;
        const ws = carouselId ? getContainerWidgets(scr.widgets, carouselId) : scr.widgets;
        if (!ws) return;
        for (const { widget } of deletedWidgets) {
          const idx = ws.findIndex((w) => w.id === widget.id);
          if (idx >= 0) ws.splice(idx, 1);
        }
        state.activeWidgetIndex = null;
        state.selectedWidgetIndices = new Set();
      },
      undo: (state) => {
        const scr = state.screenSet!.screens.find((s) => s.id === screenId);
        if (!scr) return;
        const ws = carouselId ? getContainerWidgets(scr.widgets, carouselId) : scr.widgets;
        if (!ws) return;
        for (const { index, widget } of [...deletedWidgets].reverse()) {
          const insertAt = Math.max(0, Math.min(index, ws.length));
          ws.splice(insertAt, 0, widget);
        }
      },
    };
    state.executeCommand(cmd);
    set((state) => {
      state.activeWidgetIndex = null;
      state.selectedWidgetIndices = new Set();
    });
  },
  batchMoveWidgets: (moves) => {
    const state = get();
    if (!state.screenSet || state.activeScreenIndex === null) return;
    const widgets = getWidgetListFromState(state);
    if (!widgets) return;
    const screen = state.screenSet.screens[state.activeScreenIndex];
    const carouselId = state.editingContainerId;
    const screenId = screen.id;

    const originals = moves.map(({ id }) => {
      const w = widgets.find((w) => w.id === id);
      return w ? fastCopy(w) : null;
    }).filter(Boolean) as Widget[];

    const cmd: UndoableCommand = {
      type: "widget.shape.position",
      targetId: moves[0].id,
      do: (state) => {
        const scr = state.screenSet!.screens.find((s) => s.id === screenId);
        if (!scr) return;
        const ws = carouselId ? getContainerWidgets(scr.widgets, carouselId) : scr.widgets;
        if (!ws) return;
        for (const { id, position } of moves) {
          const w = ws.find((w) => w.id === id);
          if (w) w.shape.position = position;
        }
      },
      undo: (state) => {
        const scr = state.screenSet!.screens.find((s) => s.id === screenId);
        if (!scr) return;
        const ws = carouselId ? getContainerWidgets(scr.widgets, carouselId) : scr.widgets;
        if (!ws) return;
        for (const orig of originals) {
          const w = ws.find((w) => w.id === orig.id);
          if (w) w.shape.position = orig.shape.position;
        }
      },
    };
    state.executeCommand(cmd);
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
        const newIndex = ws ? ws.length - 1 : null;
        state.activeWidgetIndex = newIndex;
        state.selectedWidgetIndices = newIndex !== null ? new Set([newIndex]) : new Set();
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
        const newIndex = ws ? ws.length - 1 : null;
        state.activeWidgetIndex = newIndex;
        state.selectedWidgetIndices = newIndex !== null ? new Set([newIndex]) : new Set();
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
      state.selectedWidgetIndices = new Set();
    });
  },
  exitContainer: () => {
    set((state) => {
      state.editingContainerId = null;
      state.activeWidgetIndex = null;
      state.selectedWidgetIndices = new Set();
    });
  },
});
