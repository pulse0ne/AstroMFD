import { CarouselAttributes, ShapeAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";
import { fastCopy } from "./fastCopy";

// TODO: add default page buttons, and make sure they can't be deleted
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
      previous: {
        id: uuid(),
        type: "carousel_button",
        shape: {
          position: { x: 112, y: 364 },
          size: { width: 24, height: 24 },
          fill: { type: "solid", value: "rgba(255, 255, 255, 0.2)" },
          stroke: "rgba(0, 0, 0, 0.0)",
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
            attributes: {
              viewbox: "0 0 512 512",
            },
            children: [
              {
                name: "path",
                parent: null,
                type: "element",
                value: "",
                attributes: {
                  "stroke-linejoin": "round",
                  "d": "M328 112L184 256l144 144",
                  "stroke": "rgba(255, 255, 255, 1)",
                  "fill": "none",
                  "stroke-width": "48",
                  "stroke-linecap": "round"
                },
                children: [],
              }
            ],
          },
          gap: 0,
          layout: "centered",
          position: "top",
          size: 18.0,
        },
        pressed: {
          shape: {}, // TODO
          text: {},
        },
      },
      next: {
        id: uuid(),
        type: "carousel_button",
        shape: {
          position: { x: 264, y: 364 },
          size: { width: 24, height: 24 },
          fill: { type: "solid", value: "rgba(255, 255, 255, 0.2)" },
          stroke: "rgba(0, 0, 0, 0.0)",
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
            attributes: {
              viewbox: "0 0 512 512",
            },
            children: [
              {
                name: "path",
                parent: null,
                type: "element",
                value: "",
                attributes: {
                  "fill": "none",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "48",
                  "stroke": "rgba(255, 255, 255, 1)",
                  "d": "M184 112l144 144-144 144",
                },
                children: [],
              }
            ],
          },
          gap: 0,
          layout: "centered",
          position: "top",
          size: 18.0,
        },
        pressed: {
          shape: {}, // TODO
          text: {},
        },
      }
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
