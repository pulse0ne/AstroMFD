import { CarouselAttributes, ShapeAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";
import { fastCopy } from "./fastCopy";

// TODO: add default page buttons, make sure they can't be deleted
export function createDefaultCarousel(): CarouselAttributes {
  return {
    id: uuid(),
    type: "carousel",
    shape: {
      svg: null,
      size: { width: 300, height: 200 },
      position: { x: 100, y: 100 },
      fill: { type: "solid", value: "#0f1e2e" },
      stroke: "#2a5070",
      shadow: null,
      strokeWidth: 1,
      cornerRadius: 4,
    },
    pages: [{ id: uuid(), widgets: [] }],
    activePageIndex: 0,
    navigation: "swipe",
  };
}

export function createCarousel(shapeAttr?: ShapeAttributes): CarouselAttributes {
  if (!shapeAttr) return createDefaultCarousel();
  return {
    id: uuid(),
    type: "carousel",
    shape: {
      svg: null,
      size: { width: 300, height: 200 },
      position: { x: 100, y: 100 },
      fill: fastCopy(shapeAttr.fill),
      stroke: shapeAttr.stroke,
      shadow: fastCopy(shapeAttr.shadow),
      strokeWidth: shapeAttr.strokeWidth,
      cornerRadius: shapeAttr.cornerRadius,
    },
    pages: [{ id: uuid(), widgets: [] }],
    activePageIndex: 0,
    navigation: "swipe",
  };
}
