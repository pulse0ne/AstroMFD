import { CarouselAttributes, Gradient } from "@common/shared/models";
import { Konva } from "konva/lib/_FullInternals";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { useEffect, useMemo, useRef } from "react";
import { Circle, Group, Rect, Text, Transformer } from "react-konva";

import { coordinatesFromAngle } from "../utils/coordinatesFromAngle.ts";
import { SvgContent } from "./SvgContent.tsx";
import { WidgetPropsBase } from "./WidgetPropsBase.ts";
import { WidgetRenderer } from "./WidgetRenderer.tsx";

export type CarouselProps = WidgetPropsBase & {
  attr: CarouselAttributes;
};

export function Carousel({
  attr,
  onSelect,
  onCommitUpdate,
  onEphemeralUpdate,
  isSelected,
}: CarouselProps) {
  const groupRef = useRef<Konva.Group | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  const fill = useMemo(() => {
    const f = attr.shape.fill;
    if (!f) return null;
    if (f.type === "solid") return f.value as string;
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

  const activePage = attr.pages[attr.activePageIndex];
  const dotRadius = 4;
  const dotSpacing = 14;
  const dotsY = attr.shape.size.height - 12;
  const dotsStartX =
    attr.shape.size.width / 2 - ((attr.pages.length - 1) * dotSpacing) / 2;

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
            fill={fill ?? undefined}
            stroke={attr.shape.stroke ?? undefined}
            strokeWidth={attr.shape.strokeWidth}
            cornerRadius={attr.shape.cornerRadius}
            {...gradientProps}
          />
        )}
        {activePage && activePage.widgets.length > 0 ? (
          <Group listening={false}>
            {activePage.widgets.map((widget) => (
              <WidgetRenderer
                key={widget.id}
                widget={widget}
                onSelect={() => {}}
                onCommitUpdate={() => {}}
                onEphemeralUpdate={() => {}}
                isSelected={false}
                state="primary"
              />
            ))}
          </Group>
        ) : (
          <Text
            text={`Page ${attr.activePageIndex + 1} (empty)`}
            width={attr.shape.size.width}
            height={attr.shape.size.height - 24}
            align="center"
            verticalAlign="middle"
            fontSize={12}
            fill="rgba(255,255,255,0.3)"
          />
        )}
        {attr.pages.length > 1 &&
          attr.pages.map((page, i) => (
            <Circle
              key={page.id}
              x={dotsStartX + i * dotSpacing}
              y={dotsY}
              radius={dotRadius}
              fill={
                i === attr.activePageIndex
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.3)"
              }
            />
          ))}
      </Group>
      {isSelected && <Transformer ref={trRef} rotateEnabled={false} />}
    </>
  );
}
