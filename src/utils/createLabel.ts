import { LabelAttributes, ShapeAttributes, TextAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createLabel(_lastStyle?: ShapeAttributes, lastTextStyle?: TextAttributes): LabelAttributes {
  return {
    id: uuid(),
    type: "label",
    shape: {
      svg: null,
      size: { width: 100, height: 75 },
      position: { x: 100, y: 100 },
      fill: null,
      stroke: null,
      shadow: null,
      strokeWidth: 0,
      cornerRadius: 0,
    },
    text: {
      text: "Label",
      font: lastTextStyle?.font || null,
      fontSize: lastTextStyle?.fontSize || 16,
      fontColor: lastTextStyle?.fontColor || "white",
      shadow: lastTextStyle?.shadow || null,
      horizontalAlignment: lastTextStyle?.horizontalAlignment || "center",
      verticalAlignment: lastTextStyle?.verticalAlignment || "middle",
    },
    icon: null,
    usesVariables: false,
  };
}
