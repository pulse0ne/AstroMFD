import { SliderAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createSlider(): SliderAttributes {
  return {
    id: uuid(),
    type: "slider",
    orientation: "horizontal",
    appearance: {
      trackColor: "#1a2a3a",
      activeColor: "#3a6a8a",
      thumbColor: "#5a9aba",
      trackThickness: 4,
      thumbSize: 10,
    },
    axis: {
      axis: "x",
      min: 0,
      max: 1,
    },
    shape: {
      svg: null,
      size: { width: 250, height: 60 },
      position: { x: 100, y: 100 },
      fill: null,
      stroke: null,
      shadow: null,
      strokeWidth: 0,
      cornerRadius: 0,
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
