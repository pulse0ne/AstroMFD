import {WidgetPropsBase} from "./WidgetPropsBase.ts";
import {Group, Rect, Text, Transformer} from "react-konva";
import {useEffect, useRef} from "react";
import {KonvaEventObject} from "konva/lib/Node";
import {Shape} from "konva/lib/Shape";
import {LabelAttributes} from "@common/shared/models";

export type LabelProps = WidgetPropsBase & {
  attr: LabelAttributes;
};

export function Label({ attr, onSelect, onCommitUpdate, onEphemeralUpdate, isSelected }: LabelProps) {
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const handleReposition = (evt: KonvaEventObject<DragEvent>) => {
    const shape = evt.target as Shape;
    onCommitUpdate({ x: shape.x(), y: shape.y(), width: attr.shape.size.width, height: attr.shape.size.height }, "widget.shape.position");
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

    onCommitUpdate({
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
    }, "widget.shape.size");
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
  }, [isSelected, attr]);

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
          fill={attr.shape.fill ?? undefined}
          stroke={attr.shape.stroke ?? undefined}
          strokeWidth={attr.shape.strokeWidth}
          cornerRadius={attr.shape.cornerRadius}
        />
        <Text
          width={attr.shape.size.width}
          height={attr.shape.size.height}
          verticalAlign={attr.text.verticalAlignment}
          align={attr.text.horizontalAlignment}
          text={attr.text.text ?? undefined}
          fontFamily={attr.text.font?.name ?? undefined}
          fontSize={attr.text.fontSize}
          fill={attr.text.fontColor ?? undefined}
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
