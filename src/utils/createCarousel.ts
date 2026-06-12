import { CarouselAttributes, CarouselPageButton, ShapeAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";
import { fastCopy } from "./fastCopy";

function createPreviousButton(): CarouselPageButton {
  return {
    id: uuid(),
    corner: "bottom-left",
    margin: 6,
    shape: {
      position: { x: 0, y: 0 },
      size: { width: 24, height: 24 },
      fill: { type: "solid", value: "rgba(255, 255, 255, 0.2)" },
      stroke: null,
      strokeWidth: 0,
      cornerRadius: 2,
      shadow: null,
      svg: null,
    },
    icon: {
      svg: {
        name: "svg",
        parent: null,
        type: "element",
        value: "",
        attributes: { viewBox: "0 0 512 512" },
        children: [
          {
            name: "path",
            parent: null,
            type: "element",
            value: "",
            attributes: {
              "d": "M328 112L184 256l144 144",
              "fill": "none",
              "stroke": "rgba(255, 255, 255, 1)",
              "stroke-width": "48",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            children: [],
          },
        ],
      },
      gap: 0,
      layout: "centered",
      position: "top",
      size: 18,
    },
    pressed: { shape: {} },
  };
}

function createNextButton(): CarouselPageButton {
  return {
    id: uuid(),
    corner: "bottom-right",
    margin: 6,
    shape: {
      position: { x: 0, y: 0 },
      size: { width: 24, height: 24 },
      fill: { type: "solid", value: "rgba(255, 255, 255, 0.2)" },
      stroke: null,
      strokeWidth: 0,
      cornerRadius: 2,
      shadow: null,
      svg: null,
    },
    icon: {
      svg: {
        name: "svg",
        parent: null,
        type: "element",
        value: "",
        attributes: { viewBox: "0 0 512 512" },
        children: [
          {
            name: "path",
            parent: null,
            type: "element",
            value: "",
            attributes: {
              "d": "M184 112l144 144-144 144",
              "fill": "none",
              "stroke": "rgba(255, 255, 255, 1)",
              "stroke-width": "48",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            children: [],
          },
        ],
      },
      gap: 0,
      layout: "centered",
      position: "top",
      size: 18,
    },
    pressed: { shape: {} },
  };
}

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
    buttons: {
      previous: createPreviousButton(),
      next: createNextButton(),
    },
  };
}

export function createCarousel(shapeAttr?: ShapeAttributes): CarouselAttributes {
  const defaultCarousel = createDefaultCarousel();
  if (!shapeAttr) return defaultCarousel;
  return {
    ...defaultCarousel,
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
  };
}
