import { ImageAttributes } from "@common/shared/models";
import { Konva } from "konva/lib/_FullInternals";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Rect } from "react-konva";

import { WidgetPropsBase } from "./WidgetPropsBase.ts";

export type ImageWidgetProps = WidgetPropsBase & {
  attr: ImageAttributes;
};

export function ImageWidget({
  attr,
  screenSetId,
  onSelect,
  onCommitUpdate,
  onEphemeralUpdate,
  onDragSnap,
}: ImageWidgetProps) {
  const groupRef = useRef<Konva.Group | null>(null);
  const [image, setImage] = useState <HTMLImageElement | null>(null);

  useEffect(() => {
    if (!attr.file) return;
    const img = new window.Image();
    img.src = `http://localhost:11011/images/${encodeURIComponent(screenSetId)}/${encodeURIComponent(attr.file)}`;
    img.onload = () => {
      setImage(img);
    };
  }, [attr.file]);

  const handleSelect = (evt: KonvaEventObject<MouseEvent>) => {
    const isMulti = evt.evt.ctrlKey || evt.evt.shiftKey;
    onSelect(isMulti);
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
    node.scaleX(1);
    node.scaleY(1);
    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;
    node.width(newWidth);
    node.height(newHeight);
    onCommitUpdate(
      { x: node.x(), y: node.y(), width: newWidth, height: newHeight },
      "widget.shape.size",
    );
  };

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
      {image ? (
        <KonvaImage
          image={image}
          width={attr.shape.size.width}
          height={attr.shape.size.height}
        />
      ) : (
        <Rect
          width={attr.shape.size.width}
          height={attr.shape.size.height}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          dash={[4, 4]}
        />
      )}
    </Group>
  );
}
