import {WidgetPropsBase} from "./WidgetPropsBase.ts";
import {PanelAttributes} from "../types/widget.ts";
import {useEffect, useRef} from "react";
import {KonvaEventObject} from "konva/lib/Node";
import {Shape} from "konva/lib/Shape";
import {Group, Rect, Transformer} from "react-konva";

export type PanelProps = WidgetPropsBase & {
  attr: PanelAttributes;
};

// TODO: Support images/svg shapes

export function Panel({ attr, onSelect, onUpdate, isSelected }: PanelProps) {
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const handleReposition = (evt: KonvaEventObject<DragEvent>) => {
    const shape = evt.target as Shape;
    onUpdate({ x: shape.x(), y: shape.y(), width: attr.shape.size.width, height: attr.shape.size.height });
  };

  const handleTransform = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;

    onUpdate({
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

    onUpdate({
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
    });
  };

  const handleSelect = (evt: KonvaEventObject<MouseEvent>)=> {
    const isMulti = evt.evt.ctrlKey || evt.evt.shiftKey;
    onSelect(isMulti);
  };

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

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
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={attr.shape.size.width}
          height={attr.shape.size.height}
          fill={attr.shape.fill ?? undefined}
          stroke={attr.shape.stroke ?? undefined}
          strokeWidth={attr.shape.strokeWidth}
          cornerRadius={attr.shape.cornerRadius}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
        />
      )}
    </>
  );
}