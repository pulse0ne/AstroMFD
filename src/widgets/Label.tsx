import { Gradient, LabelAttributes } from "@common/shared/models";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { useMemo, useRef } from "react";
import { Group, Rect, Text } from "react-konva";

import { coordinatesFromAngle } from "../utils/coordinatesFromAngle.ts";
import { computeIconLayout, IconContent } from "./IconContent.tsx";
import { SvgContent } from "./SvgContent.tsx";
import { WidgetPropsBase } from "./WidgetPropsBase.ts";

export type LabelProps = WidgetPropsBase & {
  attr: LabelAttributes;
};

export function Label({
  attr,
  onSelect,
  onCommitUpdate,
  onEphemeralUpdate,
  onDragSnap,
}: LabelProps) {
  const groupRef = useRef<any>(null);

  const fill = useMemo(() => {
    const f = attr.shape.fill;
    if (!f) return null;
    if (f.type === "solid") {
      return f.value as string;
    } else {
      return null;
    }
  }, [attr]);

  const handleReposition = (evt: KonvaEventObject<DragEvent>) => {
    const shape = evt.target as Shape;
    onCommitUpdate(
      {
        x: shape.x(),
        y: shape.y(),
        width: attr.shape.size.width,
        height: attr.shape.size.height,
      },
      "widget.shape.position",
    );
  };

  const handleDragging = (evt: KonvaEventObject<DragEvent>) => {
    const { x, y } = evt.target.position();
    const width = evt.target.width();
    const height = evt.target.height();
    if (onDragSnap) {
      const snapped = onDragSnap({ x, y }, { width, height });
      evt.target.position(snapped);
      onEphemeralUpdate({ ...snapped, width, height });
    } else {
      onEphemeralUpdate({ x, y, width, height });
    }
  };

  const handleTransform = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;

    onEphemeralUpdate({
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;

    node.scaleX(1);
    node.scaleY(1);
    node.width(newWidth);
    node.height(newHeight);

    onCommitUpdate(
      {
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
      },
      "widget.shape.size",
    );
  };

  const handleSelect = (evt: KonvaEventObject<MouseEvent>) => {
    const isMulti = evt.evt.ctrlKey || evt.evt.shiftKey;
    onSelect(isMulti);
  };

  const gradientProps = useMemo(() => {
    const f = attr.shape.fill;
    if (!f || f.type === "solid") return {};
    const gradient = f.value as Gradient;
    const stops = gradient.stops.reduce(
      (acc, stop) => {
        acc.push(stop.position / 100);
        acc.push(stop.color);
        return acc;
      },
      [] as Array<number | string>,
    );
    if (gradient.type === "linear") {
      const { start, end } = coordinatesFromAngle(
        attr.shape.size.width,
        attr.shape.size.height,
        gradient.angle ?? 0,
      );
      return {
        fillLinearGradientColorStops: stops,
        fillLinearGradientStartPoint: start,
        fillLinearGradientEndPoint: end,
      };
    }
    const centerX = attr.shape.size.width / 2;
    const centerY = attr.shape.size.height / 2;
    return {
      fillRadialGradientColorStops: stops,
      fillRadialGradientStartPoint: { x: centerX, y: centerY },
      fillRadialGradientEndPoint: { x: centerX, y: centerY },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: attr.shape.size.height, // TODO
    };
  }, [attr]);

  const iconLayout = useMemo(() => {
    if (!attr.icon) return null;
    return computeIconLayout(attr.icon, attr.shape.size.width, attr.shape.size.height);
  }, [attr.icon, attr.shape.size.width, attr.shape.size.height]);

  return (
    <Group
      id={attr.id}
      ref={groupRef}
      x={attr.shape.position.x}
      y={attr.shape.position.y}
      width={attr.shape.size.width}
      height={attr.shape.size.height}
      draggable
      onMouseDown={handleSelect}
      onDragEnd={handleReposition}
      onDragMove={handleDragging}
      onTransform={handleTransform}
      onTransformEnd={handleTransformEnd}
    >
      {attr.shape.svg ? (
        <SvgContent
          svg={attr.shape.svg}
          targetWidth={attr.shape.size.width}
          targetHeight={attr.shape.size.height}
        />
      ) : (
        <Rect
          width={attr.shape.size.width}
          height={attr.shape.size.height}
          fill={fill ?? undefined}
          stroke={attr.shape.stroke ?? undefined}
          strokeWidth={attr.shape.strokeWidth}
          cornerRadius={attr.shape.cornerRadius}
          {...gradientProps}
        />
      )}
      {attr.icon && (
        <IconContent
          icon={attr.icon}
          containerWidth={attr.shape.size.width}
          containerHeight={attr.shape.size.height}
        />
      )}
      <Text
        x={iconLayout?.textX ?? 0}
        y={iconLayout?.textY ?? 0}
        width={iconLayout?.textWidth ?? attr.shape.size.width}
        height={iconLayout?.textHeight ?? attr.shape.size.height}
        verticalAlign={attr.text.verticalAlignment}
        align={attr.text.horizontalAlignment}
        text={attr.text.text ?? undefined}
        fontFamily={attr.text.font?.name ?? undefined}
        fontSize={attr.text.fontSize}
        fill={attr.text.fontColor ?? undefined}
      />
    </Group>
  );
}
