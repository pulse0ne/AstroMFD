import {ButtonAttributes, ShapeAttributes, TextAttributes} from "../types/widget.ts";
import {Group, Rect, Text, Transformer} from "react-konva";
import {KonvaEventObject} from "konva/lib/Node";
import {useCallback, useEffect, useRef} from "react";
import {Shape} from "konva/lib/Shape";
import {WidgetPropsBase} from "./WidgetPropsBase.ts";

export type ButtonProps = WidgetPropsBase & {
  attr: ButtonAttributes;
  state: "primary" | "pressed";
};

export function Button({
  attr,
  state,
  onSelect,
  onUpdate,
  isSelected = false
}: ButtonProps) {
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const extractShapeAttr = useCallback(function _<K extends keyof ShapeAttributes>(key: K): ShapeAttributes[K] {
    if (state === "primary") {
      return attr.shape[key];
    }
    return attr.pressed.shape[key] ?? attr.shape[key];
  }, [state, attr]);

  const extractTextAttr = useCallback(function _<K extends keyof TextAttributes>(key: K): TextAttributes[K] {
    if (state === "primary") {
      return attr.text[key];
    }
    return attr.pressed.text[key] ?? attr.text[key];
  }, [state, attr]);

  const handleReposition = (evt: KonvaEventObject<DragEvent>) => {
    const shape = evt.target as Shape;
    onUpdate({ x: shape.x(), y: shape.y(), width: attr.shape.size.width, height: attr.shape.size.height });
  };

  const handleTransform = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    onUpdate({ x: node.x(), y: node.y(), width: node.width() * scaleX, height: node.height() * scaleY });
  };

  const handleSelect = (evt: KonvaEventObject<MouseEvent>)=> {
    const isMulti = evt.evt.ctrlKey || evt.evt.shiftKey;
    onSelect(isMulti);
  };

  useEffect(() => {
    console.log(isSelected, trRef.current, groupRef.current);
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // TODO: icon/image support
  return (
    <>
      <Group
        ref={groupRef}
        x={attr.shape.position.x}
        y={attr.shape.position.y}
        width={attr.shape.size.width}
        height={attr.shape.size.height}
        draggable
        // onClick={onSelect}
        onMouseDown={handleSelect}
        onDragEnd={handleReposition}
        onTransformEnd={handleTransform}
      >
        <Rect
          width={attr.shape.size.width}
          height={attr.shape.size.height}
          fill={extractShapeAttr("fill") ?? undefined}
          stroke={extractShapeAttr("stroke") ?? undefined}
          strokeWidth={extractShapeAttr("strokeWidth")}
          cornerRadius={extractShapeAttr("cornerRadius")}
        />
        <Text
          width={attr.shape.size.width}
          height={attr.shape.size.height}
          verticalAlign={extractTextAttr("verticalAlignment")}
          align={extractTextAttr("horizontalAlignment")}
          text={extractTextAttr("text") ?? undefined}
          fontFamily={extractTextAttr("font") ?? undefined}
          fontSize={extractTextAttr("fontSize")}
          fill={extractTextAttr("fontColor") ?? undefined}
        />
      </Group>
      {isSelected && <Transformer ref={trRef} rotateEnabled={false} />}
    </>
  );
}
