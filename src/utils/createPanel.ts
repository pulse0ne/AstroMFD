import {v4 as uuid} from "uuid";
import {PanelAttributes} from "@common/shared/models";

export function createPanel(): PanelAttributes {
  return {
    id: uuid(),
    type: "panel",
    shape: {
      svg: null,
      size: { width: 250, height: 150 },
      position: { x: 100, y: 100 },
      fill: { type: "solid", value: "rgba(53, 64, 79, 1)" },
      stroke: null,
      shadow: null,
      strokeWidth: 0,
      cornerRadius: 0
    }
  };
}