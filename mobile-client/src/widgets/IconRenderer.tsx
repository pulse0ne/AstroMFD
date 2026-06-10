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

export type IconLayout = {
  iconX: number;
  iconY: number;
  iconWidth: number;
  iconHeight: number;
  textX: number;
  textY: number;
  textWidth: number;
  textHeight: number;
};

export function computeIconLayout(
  icon: WidgetIcon,
  containerWidth: number,
  containerHeight: number,
): IconLayout {
  const vb = getViewBox(icon.svg);
  const aspect = vb.width / vb.height;
  const iconHeight = icon.size;
  const iconWidth = iconHeight * aspect;

  const layout = icon.layout ?? "centered";

  if (layout === "centered") {
    return computeCenteredLayout(icon, containerWidth, containerHeight, iconWidth, iconHeight);
  }

  const isVertical = icon.position === "top" || icon.position === "bottom";
  const containerAxis = isVertical ? containerHeight : containerWidth;
  const containerCross = isVertical ? containerWidth : containerHeight;
  const iconAxis = isVertical ? iconHeight : iconWidth;

  let iconStart: number;
  let textStart: number;
  let textAxis: number;

  if (layout === "equal") {
    const half = (containerAxis - icon.gap) / 2;
    if (icon.position === "top" || icon.position === "left") {
      textStart = 0;
      textAxis = half;
      iconStart = half + icon.gap + (half - iconAxis) / 2;
    } else {
      iconStart = (half - iconAxis) / 2;
      textStart = half + icon.gap;
      textAxis = half;
    }
  } else {
    // "fit" - icon takes its natural size, text gets the rest
    if (icon.position === "top" || icon.position === "left") {
      textStart = 0;
      textAxis = containerAxis - iconAxis - icon.gap;
      iconStart = textAxis + icon.gap;
    } else {
      iconStart = 0;
      textStart = iconAxis + icon.gap;
      textAxis = containerAxis - iconAxis - icon.gap;
    }
  }

  if (isVertical) {
    return {
      iconX: (containerWidth - iconWidth) / 2,
      iconY: iconStart,
      iconWidth,
      iconHeight,
      textX: 0,
      textY: textStart,
      textWidth: containerCross,
      textHeight: textAxis,
    };
  }

  return {
    iconX: iconStart,
    iconY: (containerHeight - iconHeight) / 2,
    iconWidth,
    iconHeight,
    textX: textStart,
    textY: 0,
    textWidth: textAxis,
    textHeight: containerCross,
  };
}

function computeCenteredLayout(
  icon: WidgetIcon,
  containerWidth: number,
  containerHeight: number,
  iconWidth: number,
  iconHeight: number,
): IconLayout {
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;

  if (icon.position === "bottom") {
    const iconY = cy - (iconHeight + icon.gap) / 2;
    const textY = iconY + iconHeight + icon.gap;
    return {
      iconX: cx - iconWidth / 2,
      iconY,
      iconWidth,
      iconHeight,
      textX: 0,
      textY,
      textWidth: containerWidth,
      textHeight: containerHeight - textY,
    };
  }

  if (icon.position === "top") {
    const textHeight = (containerHeight - iconHeight - icon.gap) / 2;
    const textY = Math.max(0, cy - iconHeight / 2 - icon.gap - textHeight);
    const iconY = textY + textHeight + icon.gap;
    return {
      iconX: cx - iconWidth / 2,
      iconY,
      iconWidth,
      iconHeight,
      textX: 0,
      textY,
      textWidth: containerWidth,
      textHeight,
    };
  }

  if (icon.position === "right") {
    const totalWidth = iconWidth + icon.gap;
    const iconX = cx - totalWidth / 2;
    const textX = iconX + iconWidth + icon.gap;
    return {
      iconX,
      iconY: cy - iconHeight / 2,
      iconWidth,
      iconHeight,
      textX,
      textY: 0,
      textWidth: containerWidth - textX,
      textHeight: containerHeight,
    };
  }

  // "left" - text to the left of icon
  const totalWidth = iconWidth + icon.gap;
  const textWidth = (containerWidth - totalWidth) / 2;
  const iconX = cx - iconWidth / 2 + textWidth / 2;
  return {
    iconX,
    iconY: cy - iconHeight / 2,
    iconWidth,
    iconHeight,
    textX: 0,
    textY: 0,
    textWidth: iconX - icon.gap,
    textHeight: containerHeight,
  };
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
  const layout = computeIconLayout(icon, containerWidth, containerHeight);

  const style: CSSProperties = {
    position: "absolute",
    left: layout.iconX,
    top: layout.iconY,
    width: layout.iconWidth,
    height: layout.iconHeight,
    pointerEvents: "none",
  };

  return (
    <div style={style}>
      <SvgRenderer svg={icon.svg} width={layout.iconWidth} height={layout.iconHeight} />
    </div>
  );
}
