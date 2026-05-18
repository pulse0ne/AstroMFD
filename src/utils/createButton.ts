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
    sound: null,
    shape: {
      svg: null,
      size: { width: 200, height: 100 },
      position: { x: 100, y: 100 },
      fill: { type: "solid", value: "rgb(56, 30, 83)" },
      stroke: "rgb(130, 51, 152)",
      shadow: null,
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
      shape: {},
      text: {},
    },
  };
}
