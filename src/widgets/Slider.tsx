import { Gradient, SliderAttributes } from "@common/shared/models";
import { Konva } from "konva/lib/_FullInternals";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { useEffect, useMemo, useRef } from "react";
import { Group, Line, Rect, Text, Transformer } from "react-konva";

import { coordinatesFromAngle } from "../utils/coordinatesFromAngle.ts";
import { WidgetPropsBase } from "./WidgetPropsBase.ts";

export type SliderProps = WidgetPropsBase & {
  attr: SliderAttributes;
};

export function Slider({
  attr,
  onSelect,
  onCommitUpdate,
  onEphemeralUpdate,
  isSelected,
}: SliderProps) {
  const groupRef = useRef<Konva.Group | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  const fill = useMemo(() => {
    const f = attr.shape.fill;
    if (!f) return null;
    if (f.type === "solid") {
      return f.value as string;
    }
    return null;
  }, [attr]);

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
      fillRadialGradientEndRadius: attr.shape.size.height,
    };
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
    onEphemeralUpdate({ x, y, width, height });
  };

  const handleTransform = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    onEphemeralUpdate({
      x: node.x(),
      y: node.y(),
      width: node.width() * scaleX,
      height: node.height() * scaleY,
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
      { x: node.x(), y: node.y(), width: newWidth, height: newHeight },
      "widget.shape.size",
    );
  };

  const handleSelect = (evt: KonvaEventObject<MouseEvent>) => {
    const isMulti = evt.evt.ctrlKey || evt.evt.shiftKey;
    onSelect(isMulti);
  };

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, attr]);

  const isVertical = attr.orientation === "vertical";
  const trackPadding = 16;
  const trackThickness = 4;
  const thumbRadius = 8;

  const trackPoints = useMemo(() => {
    if (isVertical) {
      const cx = attr.shape.size.width / 2;
      return [cx, trackPadding, cx, attr.shape.size.height - trackPadding];
    }
    const cy = attr.shape.size.height / 2;
    return [trackPadding, cy, attr.shape.size.width - trackPadding, cy];
  }, [attr.shape.size, isVertical]);

  const thumbPos = useMemo(() => {
    if (isVertical) {
      return { x: attr.shape.size.width / 2, y: attr.shape.size.height / 2 };
    }
    return { x: attr.shape.size.width / 2, y: attr.shape.size.height / 2 };
  }, [attr.shape.size, isVertical]);

  return (
    <>
      <Group
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
        <Rect
          width={attr.shape.size.width}
          height={attr.shape.size.height}
          fill={fill ?? undefined}
          stroke={attr.shape.stroke ?? undefined}
          strokeWidth={attr.shape.strokeWidth}
          cornerRadius={attr.shape.cornerRadius}
          {...gradientProps}
        />
        <Line
          points={trackPoints}
          stroke={attr.shape.stroke ?? "#888"}
          strokeWidth={trackThickness}
          lineCap="round"
        />
        <Rect
          x={thumbPos.x - thumbRadius}
          y={thumbPos.y - thumbRadius}
          width={thumbRadius * 2}
          height={thumbRadius * 2}
          fill={attr.shape.stroke ?? "#ccc"}
          cornerRadius={thumbRadius}
        />
        {attr.text.text && (
          <Text
            text={attr.text.text}
            width={attr.shape.size.width}
            height={attr.shape.size.height}
            fontSize={attr.text.fontSize}
            fill={attr.text.fontColor ?? "white"}
            fontFamily={attr.text.font?.name}
            align={attr.text.horizontalAlignment}
            verticalAlign={attr.text.verticalAlignment}
            padding={4}
          />
        )}
      </Group>
      {isSelected && <Transformer ref={trRef} rotateEnabled={false} />}
    </>
  );
}
