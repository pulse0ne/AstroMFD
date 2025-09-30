import {create} from "zustand/react";
import {immer} from "zustand/middleware/immer";
import {enableMapSet} from "immer";
import {RootState} from "./types.ts";
import {createScreenSetSlice} from "./screenSet.ts";
import {createScreenSlice} from "./screen.ts";
import {createWidgetSlice} from "./widget.ts";
import {createHistorySlice} from "./history.ts";

enableMapSet();

export const useECStore = create<RootState>()(
  immer((...args) => ({
    ...createScreenSetSlice(...args),
    ...createScreenSlice(...args),
    ...createWidgetSlice(...args),
    ...createHistorySlice(...args),
  }))
);
