import { SliderAttributes } from "@common/shared/models";
import { Konva } from "konva/lib/_FullInternals";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { useEffect, useMemo, useRef } from "react";
import { Circle, Group, Line, Rect, Text, Transformer } from "react-konva";

import { SvgContent } from "./SvgContent.tsx";
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
  const { trackColor, activeColor, thumbColor, trackThickness, thumbSize } =
    attr.appearance;
  const padding = thumbSize + 4;

  const trackPoints = useMemo(() => {
    if (isVertical) {
      const cx = attr.shape.size.width / 2;
      return [cx, padding, cx, attr.shape.size.height - padding];
    }
    const cy = attr.shape.size.height / 2;
    return [padding, cy, attr.shape.size.width - padding, cy];
  }, [attr.shape.size, isVertical, padding]);

  const activePoints = useMemo(() => {
    if (isVertical) {
      const cx = attr.shape.size.width / 2;
      const midY = attr.shape.size.height / 2;
      return [cx, attr.shape.size.height - padding, cx, midY];
    }
    const cy = attr.shape.size.height / 2;
    const midX = attr.shape.size.width / 2;
    return [padding, cy, midX, cy];
  }, [attr.shape.size, isVertical, padding]);

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
          />
        )}
        <Line
          points={trackPoints}
          stroke={trackColor}
          strokeWidth={trackThickness}
          lineCap="round"
        />
        <Line
          points={activePoints}
          stroke={activeColor}
          strokeWidth={trackThickness}
          lineCap="round"
        />
        <Circle
          x={thumbPos.x}
          y={thumbPos.y}
          radius={thumbSize}
          fill={thumbColor}
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
