import { WidgetIcon } from "@common/shared/models";
import { Group } from "react-konva";

import { SvgUtils } from "../utils/svg/parseSvg.ts";
import { SvgContent } from "./SvgContent.tsx";

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
  const vb = SvgUtils.getSvgViewBox(icon.svg);
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

export function IconContent({
  icon,
  containerWidth,
  containerHeight,
}: {
  icon: WidgetIcon;
  containerWidth: number;
  containerHeight: number;
}) {
  const layout = computeIconLayout(icon, containerWidth, containerHeight);

  return (
    <Group x={layout.iconX} y={layout.iconY}>
      <SvgContent
        svg={icon.svg}
        targetWidth={layout.iconWidth}
        targetHeight={layout.iconHeight}
      />
    </Group>
  );
}
