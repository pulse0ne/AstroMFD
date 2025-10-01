import {Screen, ScreenSet, Size, Widget} from "../types/widget.ts";
import {History} from "./history.ts";
import {UndoableCommand} from "./command.ts";

export type WidgetSlice = {
  // state
  activeWidgetIndex: number | null;

  // mutators
  setActiveWidgetIndex: (index: number) => void;
  unsetActiveWidgetIndex: () => void;
  updateWidget: (widget: Widget, changeType: string) => void;
  nudge: (x: number, y: number) => void;
  deleteActiveWidget: () => void;
  addWidget: (widget: Widget) => void;
  sendForward: () => void;
  sendBackward: () => void;
  sendToFront: () => void;
  sendToBack: () => void;
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

export type RootState = WidgetSlice & ScreenSlice & ScreenSetSlice & HistorySlice;
