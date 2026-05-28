import { ImageAttributes } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createImage(file: string): ImageAttributes {
  return {
    id: uuid(),
    type: "image",
    file,
    shape: {
      svg: null,
      size: { width: 200, height: 200 },
      position: { x: 100, y: 100 },
      fill: null,
      stroke: null,
      shadow: null,
      strokeWidth: 0,
      cornerRadius: 0,
    },
  };
}
