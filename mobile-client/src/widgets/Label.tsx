import type {LabelAttributes} from "@common/shared/models";
import type {CSSProperties} from "react";
import {hAlignmentMap, vAlignmentMap} from "./common.ts";

export type LabelProps = {
  attr: LabelAttributes;
  // TODO: variables
};

export function Label({ attr }: LabelProps) {
  const shapeStyle: CSSProperties = {
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

  const textContainerStyle: CSSProperties = {
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
      {attr.text.text && (
        <div style={textContainerStyle}>
          <div style={textStyle}>{attr.text.text}</div>
        </div>
      )}
    </div>
  );
}
