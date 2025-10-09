export type FontSpec = {
  name: string;
  format: string;
  postscriptName: string;
};

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

export type ButtonAction = {
  button: number;
  duration: number;
};

export type ButtonAttributes = WidgetBase<"button"> & {
  buttonType: ButtonType;
  vjoyButton: ButtonAction;
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