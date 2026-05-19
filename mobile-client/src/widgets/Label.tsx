import type { Gradient, LabelAttributes } from "@common/shared/models";
import { useMemo, type CSSProperties } from "react";

import { gradientString } from "../utils.ts";
import { hAlignmentMap, vAlignmentMap } from "./common.ts";
import { SvgRenderer } from "./SvgRenderer.tsx";

export type LabelProps = {
  attr: LabelAttributes;
  // TODO: variables
};

export function Label({ attr }: LabelProps) {
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
    background: attr.shape.svg ? undefined : (fill ?? "transparent"),
    borderWidth: attr.shape.svg ? undefined : attr.shape.strokeWidth,
    borderStyle: attr.shape.svg ? undefined : "solid",
    borderColor: attr.shape.svg ? undefined : (attr.shape.stroke ?? "transparent"),
    borderRadius: attr.shape.svg ? undefined : attr.shape.cornerRadius,
  };

  const textContainerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: vAlignmentMap[attr.text.verticalAlignment],
    alignItems: hAlignmentMap[attr.text.horizontalAlignment],
  };

  const textStyle: CSSProperties = {
    color: attr.text.fontColor ?? undefined,
    fontFamily: attr.text.font?.name,
    fontSize: attr.text.fontSize,
  };

  return (
    <div style={shapeStyle}>
      {attr.shape.svg && (
        <SvgRenderer
          svg={attr.shape.svg}
          width={attr.shape.size.width}
          height={attr.shape.size.height}
        />
      )}
      {attr.text.text && (
        <div style={textContainerStyle}>
          <div style={textStyle}>{attr.text.text}</div>
        </div>
      )}
    </div>
  );
}
