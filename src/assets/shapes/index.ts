import arrowDown from "./arrow-down.svg?raw";
import arrowUp from "./arrow-up.svg?raw";
import capsule from "./capsule.svg?raw";
import chevronLeft from "./chevron-left.svg?raw";
import chevronRight from "./chevron-right.svg?raw";
import circle from "./circle.svg?raw";
import cross from "./cross.svg?raw";
import diamond from "./diamond.svg?raw";
import hexagon from "./hexagon.svg?raw";
import octagon from "./octagon.svg?raw";
import parallelogram from "./parallelogram.svg?raw";
import pentagon from "./pentagon.svg?raw";
import star from "./star.svg?raw";
import trapezoid from "./trapezoid.svg?raw";
import triangle from "./triangle.svg?raw";

export type ShapePreset = {
  name: string;
  svg: string;
};

export const shapePresets: ShapePreset[] = [
  { name: "Circle", svg: circle },
  { name: "Triangle", svg: triangle },
  { name: "Diamond", svg: diamond },
  { name: "Pentagon", svg: pentagon },
  { name: "Hexagon", svg: hexagon },
  { name: "Octagon", svg: octagon },
  { name: "Star", svg: star },
  { name: "Cross", svg: cross },
  { name: "Capsule", svg: capsule },
  { name: "Trapezoid", svg: trapezoid },
  { name: "Parallelogram", svg: parallelogram },
  { name: "Chevron Right", svg: chevronRight },
  { name: "Chevron Left", svg: chevronLeft },
  { name: "Arrow Up", svg: arrowUp },
  { name: "Arrow Down", svg: arrowDown },
];
