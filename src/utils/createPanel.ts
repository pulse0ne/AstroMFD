import { PanelAttributes, ShapeAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";
import { fastCopy } from "./fastCopy";

export function createDefaultPanel(): PanelAttributes {
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

export function createPanel(lastStyle?: ShapeAttributes): PanelAttributes {
  if (!lastStyle) return createDefaultPanel();
  return {
    id: uuid(),
    type: "panel",
    widgets: [],
    shape: {
      svg: null,
      size: { width: 250, height: 150 },
      position: { x: 100, y: 100 },
      fill: fastCopy(lastStyle.fill),
      stroke: lastStyle.stroke,
      shadow: fastCopy(lastStyle.shadow),
      strokeWidth: lastStyle.strokeWidth,
      cornerRadius: lastStyle.cornerRadius,
    },
  };
}
