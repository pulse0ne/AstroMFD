import { CarouselAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createCarousel(): CarouselAttributes {
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
