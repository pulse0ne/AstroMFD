import { SliderAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createSlider(): SliderAttributes {
  return {
    id: uuid(),
    type: "slider",
    orientation: "horizontal",
    axis: {
      axis: "x",
      min: 0,
      max: 1,
    },
    shape: {
      svg: null,
      size: { width: 250, height: 60 },
      position: { x: 100, y: 100 },
      fill: { type: "solid", value: "rgb(56, 30, 83)" },
      stroke: "rgb(130, 51, 152)",
      shadow: null,
      strokeWidth: 1,
      cornerRadius: 8,
    },
    text: {
      text: "Slider",
      font: null,
      fontSize: 12,
      fontColor: "white",
      shadow: null,
      horizontalAlignment: "center",
      verticalAlignment: "top",
    },
  };
}
