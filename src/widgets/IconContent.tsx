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

  // Icon is always centered. `position` describes where text goes relative to icon.
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;

  if (icon.position === "bottom") {
    // text below icon
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
    // text above icon
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
    // text to the right of icon
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
  const textX = 0;
  const iconX = cx - iconWidth / 2 + textWidth / 2;
  return {
    iconX,
    iconY: cy - iconHeight / 2,
    iconWidth,
    iconHeight,
    textX,
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
