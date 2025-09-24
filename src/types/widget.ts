import { v4 as uuid } from "uuid";
import {FontSpec} from "./fonts.ts";

export type TextAttributes = {
  text: string | null;
  font: FontSpec | null;
  fontSize: number;
  fontColor: string | null;
  horizontalAlignment: "left" | "center" | "right";
  verticalAlignment: "top" | "middle" | "bottom";
};

export type ShapeAttributes = {
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  cornerRadius: number;
  size: Size;
  position: Position;
};

export type Size = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export type WidgetType = "button" | "label" | "panel";

export type WidgetBase<W extends WidgetType> = {
  type: W;
  id: string;
  shape: ShapeAttributes;
};

export type ButtonType = "action" | "navigation" | "toggle";

export type ButtonAttributes = WidgetBase<"button"> & {
  buttonType: ButtonType;
  vjoyButton: number; // TODO: duration?
  navTarget: string | null;
  text: TextAttributes;
  pressed: {
    shape: Partial<ShapeAttributes>;
    text: Partial<TextAttributes>;
  };
};

export type LabelAttributes = WidgetBase<"label"> & {
  usesVariables: boolean;
  text: TextAttributes;
};

export type PanelAttributes = WidgetBase<"panel">;

export type Widget = ButtonAttributes | LabelAttributes | PanelAttributes;

export type Screen = {
  id: string;
  name: string;
  backgroundColor: string; // TODO: support image?
  widgets: Widget[];
};

export type ScreenSet = {
  id: string;
  name: string;
  size: Size;
  screens: Screen[];
};

export function createScreen(screenNum: number = 1): Screen {
  return {
    id: uuid(),
    name: `Untitled screen ${screenNum}`,
    backgroundColor: "black",
    widgets: []
  };
}

export function createButton(): ButtonAttributes {
  return {
    id: uuid(),
    type: "button",
    buttonType: "action",
    vjoyButton: 1,
    navTarget: null,
    shape: {
      size: { width: 200, height: 100 },
      position: { x: 100, y: 100 },
      fill: "rgb(56, 30, 83)",
      stroke: "rgb(130, 51, 152)",
      strokeWidth: 1,
      cornerRadius: 8
    },
    text: {
      text: "Button",
      font: null,
      fontSize: 16,
      fontColor: "white",
      horizontalAlignment: "center",
      verticalAlignment: "middle"
    },
    pressed: {
      shape: {},
      text: {}
    }
  };
}

export function createLabel(): LabelAttributes {
  return {
    id: uuid(),
    type: "label",
    shape: {
      size: { width: 100, height: 75 },
      position: { x: 100, y: 100 },
      fill: null,
      stroke: null,
      strokeWidth: 0,
      cornerRadius: 0
    },
    text: {
      text: "Label",
      font: null,
      fontSize: 16,
      fontColor: "white",
      horizontalAlignment: "center",
      verticalAlignment: "middle"
    },
    usesVariables: false
  };
}

export function createPanel(): PanelAttributes {
  return {
    id: uuid(),
    type: "panel",
    shape: {
      size: { width: 250, height: 150 },
      position: { x: 100, y: 100 },
      fill: "gray",
      stroke: null,
      strokeWidth: 0,
      cornerRadius: 0
    }
  };
}

export type ScreenSetValidationResult = {
  valid: boolean;
  errors: string[];
};

export function screenSetIsValid(s: ScreenSet): ScreenSetValidationResult {
  const errors: string[] = [];

  if (s.screens.length > 1) {
    const screenIdToName = s.screens.reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {} as Record<string, string>);
    const screenIds = s.screens.map(screen => screen.id);
    const screenIdsWithoutNavRoute = [...screenIds];
    s.screens.forEach(screen => {
      // TODO: when we add triggers, we can remove the screen since the trigger is considered a route
      screen.widgets.forEach(w => {
        if (w.type === "button" && w.navTarget) {
          if (!screenIds.includes(w.navTarget)) {
            errors.push(`Nav button in ${screen.name} points to a non-existent target.`);
          }
          const index = screenIdsWithoutNavRoute.indexOf(w.navTarget);
          if (index > -1) {
            screenIdsWithoutNavRoute.splice(index, 1);
          }
        }
      });
    });
    screenIdsWithoutNavRoute.forEach(id => {
      const screenName = screenIdToName[id];
      errors.push(`Screen "${screenName}" does not have a nav route to it.`);
    });
  }

  return { valid: errors.length === 0, errors };
}
