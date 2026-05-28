import type { SvgXmlNode, WidgetIcon } from "@common/shared/models";
import type { CSSProperties } from "react";

import { SvgRenderer } from "./SvgRenderer.tsx";

function getViewBox(svg: SvgXmlNode) {
  if (svg.attributes.viewBox) {
    const parts = svg.attributes.viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      return { width: parts[2], height: parts[3] };
    }
  }
  const w = parseFloat(svg.attributes.width || "100");
  const h = parseFloat(svg.attributes.height || "100");
  return { width: w, height: h };
}

export function IconRenderer({
  icon,
  containerWidth,
  containerHeight,
}: {
  icon: WidgetIcon;
  containerWidth: number;
  containerHeight: number;
}) {
  const vb = getViewBox(icon.svg);
  const aspect = vb.width / vb.height;
  const iconHeight = icon.size;
  const iconWidth = iconHeight * aspect;

  const style: CSSProperties = {
    position: "absolute",
    width: iconWidth,
    height: iconHeight,
    pointerEvents: "none",
  };

  // Icon is always centered; position describes where text goes
  style.left = (containerWidth - iconWidth) / 2;
  style.top = (containerHeight - iconHeight) / 2;

  return (
    <div style={style}>
      <SvgRenderer svg={icon.svg} width={iconWidth} height={iconHeight} />
    </div>
  );
}
