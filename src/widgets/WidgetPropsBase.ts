import { Position, Size } from "@common/shared/models";

export type SnapFn = (pos: Position, size: Size) => Position;

export type WidgetPropsBase = {
  screenSetId: string;
  onSelect: (multi: boolean) => void;
  onCommitUpdate: (sizePos: Size & Position, type: string) => void;
  onEphemeralUpdate: (sizePos: Size & Position) => void;
  onDragSnap?: SnapFn;
  isSelected: boolean;
};
