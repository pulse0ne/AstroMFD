import {Draft} from "immer";
import {RootState} from "./types.ts";

export type ScreenState = {
  activeWidgetIndex: number | null;
  screen: Screen;
};

export type UndoableCommand = {
  type: string;
  targetId?: string;
  do: (state: Draft<RootState>) => void;
  undo: (state: Draft<RootState>) => void;
};
