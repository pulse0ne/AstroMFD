import { ButtonAttributes, InputKey } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createButton(defaultKey?: InputKey): ButtonAttributes {
  const key: InputKey = defaultKey || { type: "joystickButton", button: 1 };
  return {
    id: uuid(),
    type: "button",
    buttonType: "action",
    input: {
      steps: [{ type: "press", key, duration: 100 }],
    },
    navTarget: null,
    icon: null,
    shape: {
      svg: null,
      size: { width: 200, height: 100 },
      position: { x: 100, y: 100 },
      fill: { type: "solid", value: "#1a2a3a" },
      stroke: "#3a6a8a",
      shadow: { color: "#3a6a8a", strength: 3, xOffset: 0, yOffset: 0 },
      strokeWidth: 1,
      cornerRadius: 8,
    },
    text: {
      text: "Button",
      font: null,
      fontSize: 16,
      fontColor: "white",
      shadow: null,
      horizontalAlignment: "center",
      verticalAlignment: "middle",
    },
    pressed: {
      shape: {
        fill: { type: "solid", value: "rgba(81, 113, 147, 1)" },
      },
      text: {},
    },
  };
}
