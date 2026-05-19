export type SpecialKey =
  | "enter"
  | "space"
  | "tab"
  | "escape"
  | "backspace"
  | "delete"
  | "home"
  | "end"
  | "pageUp"
  | "pageDown"
  | "arrowUp"
  | "arrowDown"
  | "arrowLeft"
  | "arrowRight"
  | "leftShift"
  | "rightShift"
  | "leftCtrl"
  | "rightCtrl"
  | "leftAlt"
  | "rightAlt"
  | "capsLock";

export type InputKey =
  | { type: "joystickButton"; button: number }
  | { type: "letter"; key: string }
  | { type: "number"; key: number }
  | { type: "functionKey"; key: number }
  | { type: "specialKey"; key: SpecialKey };

export type GradientStop = {
  id: string;
  color: string;
  position: number; // 0–100
};

export type Gradient = {
  type: "linear" | "radial";
  angle?: number | null;
  stops: GradientStop[];
};

export type Color = {
  type: "solid" | "gradient";
  value: string | Gradient;
};

export type FontSpec = {
  name: string;
  format: string;
  postscriptName: string;
};

export type SvgXmlNode = {
  name: string;
  type: "element" | "text";
  value: string;
  parent: SvgXmlNode | null;
  attributes: Record<string, string>;
  children: SvgXmlNode[];
};

export type ShadowEffect = {
  color: string;
  strength: number;
  xOffset: number;
  yOffset: number;
};

export type TextAttributes = {
  text: string | null;
  font: FontSpec | null;
  fontSize: number;
  fontColor: string | null;
  shadow: ShadowEffect | null;
  horizontalAlignment: "left" | "center" | "right";
  verticalAlignment: "top" | "middle" | "bottom";
};

export type ShapeAttributes = {
  svg: SvgXmlNode | null;
  fill: Color | null;
  stroke: string | null;
  strokeWidth: number;
  cornerRadius: number;
  shadow: ShadowEffect | null;
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

export type JoystickAxis =
  | "x"
  | "y"
  | "z"
  | "rx"
  | "ry"
  | "rz"
  | "slider1"
  | "slider2";

export type SliderOrientation = "horizontal" | "vertical";

export type SliderAppearance = {
  trackColor: string;
  activeColor: string;
  thumbColor: string;
  trackThickness: number;
  thumbSize: number;
};

export type SliderAction = {
  axis: JoystickAxis;
  min: number;
  max: number;
};

export type WidgetType = "button" | "label" | "panel" | "slider" | "carousel";

export type WidgetBase<W extends WidgetType> = {
  type: W;
  id: string;
  shape: ShapeAttributes;
};

export type ButtonType = "action" | "navigation" | "toggle";

export type ActionStep =
  | { type: "press"; key: InputKey; duration: number }
  | { type: "keyDown"; key: InputKey }
  | { type: "keyUp"; key: InputKey }
  | { type: "pause"; duration: number }
  | { type: "playSound"; file: string; source: string; volume: number };

export type ActionSequence = {
  steps: ActionStep[];
};

export type ButtonAttributes = WidgetBase<"button"> & {
  buttonType: ButtonType;
  input: ActionSequence;
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

export type PanelAttributes = WidgetBase<"panel"> & {
  widgets: Widget[];
};

export type SliderAttributes = WidgetBase<"slider"> & {
  orientation: SliderOrientation;
  appearance: SliderAppearance;
  axis: SliderAction;
  text: TextAttributes;
};

export type CarouselPage = {
  id: string;
  widgets: Widget[];
};

export type CarouselNavigation = "swipe" | "buttons" | "both";

export type CarouselAttributes = WidgetBase<"carousel"> & {
  pages: CarouselPage[];
  activePageIndex: number;
  navigation: CarouselNavigation;
};

export type Widget =
  | ButtonAttributes
  | LabelAttributes
  | PanelAttributes
  | SliderAttributes
  | CarouselAttributes;

// export type CrtEffect = {
//   color: string;
//   lineSize: number;
//   strength: number;
// };

export type Screen = {
  id: string;
  name: string;
  backgroundColor: string; // TODO: support image?
  crtEffect: boolean;
  widgets: Widget[];
};

export type ScreenSet = {
  id: string;
  name: string;
  size: Size;
  screens: Screen[];
};
