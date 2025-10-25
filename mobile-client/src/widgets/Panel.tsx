import type {Gradient, PanelAttributes} from "@common/shared/models";
import {type CSSProperties, useMemo} from "react";
import {gradientString} from "../utils.ts";

export type PanelProps = {
  attr: PanelAttributes;
};

export function Panel({ attr }: PanelProps) {
  const fill = useMemo(() => {
    const f = attr.shape.fill;
    if (!f) return null;
    if (f.type === "solid") {
      return f.value as string;
    } else {
      return gradientString(f.value as Gradient);
    }
  }, [attr]);

  const shapeStyle: CSSProperties = {
    pointerEvents: "none",
    position: "absolute",
    left: attr.shape.position.x,
    top: attr.shape.position.y,
    width: attr.shape.size.width,
    height: attr.shape.size.height,
    background: fill ?? "transparent",
    borderWidth: attr.shape.strokeWidth,
    borderStyle: "solid",
    borderColor: attr.shape.stroke ?? "transparent",
    borderRadius: attr.shape.cornerRadius,
  };

  return (
    <div style={shapeStyle}></div>
  );
}
