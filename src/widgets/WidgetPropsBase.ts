import {Position, Size} from "../types/widget.ts";

export type WidgetPropsBase = {
  onSelect: (multi: boolean) => void;
  onCommitUpdate: (sizePos: Size & Position, type: string) => void;
  onEphemeralUpdate: (sizePos: Size & Position) => void;
  isSelected: boolean;
};
