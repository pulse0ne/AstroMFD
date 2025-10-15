import { v4 as uuid } from "uuid";
import {ButtonAttributes} from "@common/shared/models";

export function createButton(): ButtonAttributes {
  return {
    id: uuid(),
    type: "button",
    buttonType: "action",
    vjoyButton: {
      button: 1,
      fixedDuration: false,
      duration: 100
    },
    navTarget: null,
    shape: {
      svg: null,
      size: { width: 200, height: 100 },
      position: { x: 100, y: 100 },
      fill: "rgb(56, 30, 83)",
      stroke: "rgb(130, 51, 152)",
      shadow: null,
      strokeWidth: 1,
      cornerRadius: 8
    },
    text: {
      text: "Button",
      font: null,
      fontSize: 16,
      fontColor: "white",
      shadow: null,
      horizontalAlignment: "center",
      verticalAlignment: "middle"
    },
    pressed: {
      shape: {},
      text: {}
    }
  };
}
