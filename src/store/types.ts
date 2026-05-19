import { Screen, ScreenSet, Size, Widget } from "@common/shared/models";

import { UndoableCommand } from "./command.ts";
import { History } from "./history.ts";

export type WidgetSlice = {
  // state
  activeWidgetIndex: number | null;
  editingContainerId: string | null;

  // mutators
  setActiveWidgetIndex: (index: number) => void;
  unsetActiveWidgetIndex: () => void;
  updateWidget: (widget: Widget, changeType: string) => void;
  nudge: (x: number, y: number) => void;
  deleteActiveWidget: () => void;
  duplicateActiveWidget: () => void;
  addWidget: (widget: Widget) => void;
  sendForward: () => void;
  sendBackward: () => void;
  sendToFront: () => void;
  sendToBack: () => void;
  enterContainer: (id: string) => void;
  exitContainer: () => void;
};

export type ScreenSlice = {
  // state
  activeScreenIndex: number | null;

  // mutators
  setActiveScreenIndex: (index: number) => void;
  unsetActiveScreenIndex: () => void;
  updateScreen: (screen: Screen) => void;
};

export type ScreenSetSlice = {
  // state
  screenSet: ScreenSet | null;

  // mutators
  setActiveScreenSet: (screenSet: ScreenSet) => void;
  unsetActiveScreenSet: () => void;
  updateSize: (size: Size) => void;
  addScreen: (screen: Screen) => void;
  deleteScreen: (id: string) => void;
};

export type HistorySlice = {
  // state
  histories: Map<string, History>;

  // mutators
  executeCommand: (cmd: UndoableCommand) => void;
  undo: () => void;
  redo: () => void;
};

export type RootState = WidgetSlice &
  ScreenSlice &
  ScreenSetSlice &
  HistorySlice;
