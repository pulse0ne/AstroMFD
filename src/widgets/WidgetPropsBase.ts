import { Position, Size } from "@common/shared/models";

export type WidgetPropsBase = {
  onSelect: (multi: boolean) => void;
  onCommitUpdate: (sizePos: Size & Position, type: string) => void;
  onEphemeralUpdate: (sizePos: Size & Position) => void;
  isSelected: boolean;
};
