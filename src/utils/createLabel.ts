import { LabelAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createLabel(): LabelAttributes {
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
      font: null,
      fontSize: 16,
      fontColor: "white",
      shadow: null,
      horizontalAlignment: "center",
      verticalAlignment: "middle",
    },
    usesVariables: false,
  };
}
