import { StateCreator } from "zustand";
import { LastStyleSlice, RootState } from "./types";
import { ShapeAttributes, TextAttributes } from "@common/shared/models";

export const createLastStyleSlice: StateCreator<
  RootState,
  [["zustand/immer", never]],
  [],
  LastStyleSlice
> = (set) => ({
  // state
  lastStyle: null,
  lastTextStyle: null,

  // mutators
  updateLastStyle: (style: ShapeAttributes | null) => {
    set((state) => {
      state.lastStyle = style;
    });
  },

  updateLastTextStyle: (text: TextAttributes | null) => {
    set((state) => {
      state.lastTextStyle = text;
    })
  },
});
