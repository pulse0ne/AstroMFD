import { PanelAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createPanel(): PanelAttributes {
  return {
    id: uuid(),
    type: "panel",
    widgets: [],
    shape: {
      svg: null,
      size: { width: 250, height: 150 },
      position: { x: 100, y: 100 },
      fill: { type: "solid", value: "#0f1e2e" },
      stroke: "#2a5070",
      shadow: null,
      strokeWidth: 1,
      cornerRadius: 0,
    },
  };
}
