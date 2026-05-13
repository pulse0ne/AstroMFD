import { Draft } from "immer";

import { RootState } from "./types.ts";

export type UndoableCommand = {
  type: string;
  targetId?: string;
  do: (state: Draft<RootState>) => void;
  undo: (state: Draft<RootState>) => void;
};
