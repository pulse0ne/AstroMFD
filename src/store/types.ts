import {Screen, ScreenSet, Size, Widget} from "../types/widget.ts";
import {History} from "./history.ts";

export type WidgetSlice = {
  // state
  activeWidgetIndex: number | null;

  // mutators
  setActiveWidgetIndex: (index: number) => void;
  unsetActiveWidgetIndex: () => void;
  updateWidget: (widget: Widget) => void;
  nudge: (x: number, y: number) => void;
  deleteActiveWidget: () => void;

  // accessors
  getActiveWidget: () => Widget | null;
};

export type ScreenSlice = {
  // state
  activeScreenIndex: number | null;

  // mutators
  setActiveScreenIndex: (index: number) => void;
  unsetActiveScreenIndex: () => void;
  updateScreen: (screen: Screen) => void;
  addWidget: (widget: Widget) => void;
  sendForward: () => void;
  sendBackward: () => void;
  sendToFront: () => void;
  sendToBack: () => void;

  // accessors
  getActiveScreen: () => Screen | null;
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
  histories: Record<string, History>;

  // mutators
  undo: () => void;
  redo: () => void;

  // accessors
  hasUndos: () => boolean;
  hasRedos: () => boolean;
};

export type RootState = WidgetSlice & ScreenSlice & ScreenSetSlice & HistorySlice;
