import type {PanelAttributes} from "@common/shared/models";
import type {CSSProperties} from "react";

export type PanelProps = {
  attr: PanelAttributes;
};

export function Panel({ attr }: PanelProps) {
  const shapeStyle: CSSProperties = {
    pointerEvents: "none",
    position: "absolute",
    left: attr.shape.position.x,
    top: attr.shape.position.y,
    width: attr.shape.size.width,
    height: attr.shape.size.height,
    backgroundColor: attr.shape.fill ?? "transparent",
    borderWidth: attr.shape.strokeWidth,
    borderStyle: "solid",
    borderColor: attr.shape.stroke ?? "transparent",
    borderRadius: attr.shape.cornerRadius,
  };

  return (
    <div style={shapeStyle}></div>
  );
}
