import {
  ButtonAttributes,
  Gradient,
  ShapeAttributes,
  TextAttributes,
} from "@common/shared/models";
import { Konva } from "konva/lib/_FullInternals";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";

import { coordinatesFromAngle } from "../utils/coordinatesFromAngle.ts";
import { SvgContent } from "./SvgContent.tsx";
import { WidgetPropsBase } from "./WidgetPropsBase.ts";

export type ButtonProps = WidgetPropsBase & {
  attr: ButtonAttributes;
  state: "primary" | "pressed";
};

export function Button({
  attr,
  state,
  onSelect,
  onCommitUpdate,
  onEphemeralUpdate,
  isSelected = false,
}: ButtonProps) {
  const groupRef = useRef<Konva.Group | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  const fill = useMemo(() => {
    const f = state === "primary" ? attr.shape.fill : attr.pressed.shape.fill;
    if (!f) return null;
    if (f.type === "solid") {
      return f.value as string;
    } else {
      return null;
    }
  }, [attr, state]);

  const extractShapeAttr = useCallback(
    function _<K extends keyof ShapeAttributes>(key: K): ShapeAttributes[K] {
      if (state === "primary") {
        return attr.shape[key];
      }
      return attr.pressed.shape[key] ?? attr.shape[key];
    },
    [state, attr],
  );

  const extractTextAttr = useCallback(
    function _<K extends keyof TextAttributes>(key: K): TextAttributes[K] {
      if (state === "primary") {
        return attr.text[key];
      }
      return attr.pressed.text[key] ?? attr.text[key];
    },
    [state, attr],
  );

  const extractFontName = () => {
    if (state === "primary") {
      return attr.text.font?.name;
    }
    return attr.text.font?.name ?? attr.text.font?.name;
  };

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

  const handleTransform = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;

    // TODO: find a way to fix the silly Text stretching

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

  const handleDragging = (evt: KonvaEventObject<DragEvent>) => {
    const { x, y } = evt.target.position();
    const width = evt.target.width();
    const height = evt.target.height();
    onEphemeralUpdate({ x, y, width, height });
  };

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current?.nodes([groupRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected, attr]);

  const textShadow = extractTextAttr("shadow");
  const shapeShadow = extractShapeAttr("shadow");

  const gradientProps = useMemo(() => {
    const f = state === "primary" ? attr.shape.fill : attr.pressed.shape.fill;
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
  }, [state, attr]);

  // TODO: icon/image support
  return (
    <>
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
            stroke={extractShapeAttr("stroke") ?? undefined}
            strokeWidth={extractShapeAttr("strokeWidth")}
            cornerRadius={extractShapeAttr("cornerRadius")}
            shadowColor={shapeShadow?.color ?? undefined}
            shadowOffsetX={shapeShadow?.xOffset ?? undefined}
            shadowOffsetY={shapeShadow?.yOffset ?? undefined}
            shadowBlur={
              shapeShadow?.strength ? shapeShadow.strength * 6 : undefined
            }
            {...gradientProps}
          />
        )}
        <Text
          width={attr.shape.size.width}
          height={attr.shape.size.height}
          verticalAlign={extractTextAttr("verticalAlignment")}
          align={extractTextAttr("horizontalAlignment")}
          text={extractTextAttr("text") ?? undefined}
          fontFamily={extractFontName() ?? undefined}
          fontSize={extractTextAttr("fontSize")}
          fill={extractTextAttr("fontColor") ?? undefined}
          shadowColor={textShadow?.color ?? undefined}
          shadowOffsetX={textShadow?.xOffset ?? undefined}
          shadowOffsetY={textShadow?.yOffset ?? undefined}
          shadowBlur={
            textShadow?.strength ? textShadow.strength * 6 : undefined
          }
        />
      </Group>
      {isSelected && <Transformer ref={trRef} rotateEnabled={false} />}
    </>
  );
}
