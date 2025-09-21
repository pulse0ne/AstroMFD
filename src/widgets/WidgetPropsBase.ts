import {Position, Size} from "../types/widget.ts";

export type WidgetPropsBase = {
  onSelect: (multi: boolean) => void;
  onUpdate: (sizePos: Size & Position) => void;
  isSelected: boolean;
};
