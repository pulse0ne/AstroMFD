import type { ImageAttributes } from "@common/shared/models";
import type { CSSProperties } from "react";

export type ImageWidgetProps = {
  attr: ImageAttributes;
  screenSetId: string;
};

export function ImageWidget({ attr, screenSetId }: ImageWidgetProps) {
  const style: CSSProperties = {
    position: "absolute",
    left: attr.shape.position.x,
    top: attr.shape.position.y,
    width: attr.shape.size.width,
    height: attr.shape.size.height,
    pointerEvents: "none",
  };

  return (
    <img
      src={`/images/${encodeURIComponent(screenSetId)}/${encodeURIComponent(attr.file)}`}
      alt=""
      style={style}
      draggable={false}
    />
  );
}
