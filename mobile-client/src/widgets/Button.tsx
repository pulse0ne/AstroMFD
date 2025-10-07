import {type CSSProperties, useCallback} from "react";
import type {ButtonAttributes, TextAttributes} from "@common/shared/models";

const hAlignmentMap: Record<TextAttributes["horizontalAlignment"], CSSProperties["justifyItems"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end"
};

const vAlignmentMap: Record<TextAttributes["verticalAlignment"], CSSProperties["alignContent"]> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end"
};

export type ButtonProps = {
  attr: ButtonAttributes;
  onPress: (button: number, duration: number) => void;
};

export function Button({ attr, onPress }: ButtonProps) {
  const shapeStyle: CSSProperties = {
    position: "absolute",
    left: attr.shape.position.x,
    top: attr.shape.position.y,
    width: attr.shape.size.width,
    height: attr.shape.size.height,
    backgroundColor: attr.shape.fill ?? "transparent",
    borderWidth: attr.shape.strokeWidth,
    borderStyle: "solid",
    borderColor: attr.shape.stroke ?? "transparent",
    borderRadius: attr.shape.cornerRadius,
  };

  const textContainerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: vAlignmentMap[attr.text.verticalAlignment],
    alignItems: hAlignmentMap[attr.text.horizontalAlignment],
  };

  const textStyle: CSSProperties = {
    color: attr.text.fontColor ?? undefined,
    fontFamily: attr.text.font?.name,
    fontSize: attr.text.fontSize,
  };

  const handlePress = useCallback(() => {
    const { button, duration } = attr.vjoyButton;
    onPress(button, duration);
  }, [attr]);

  return (
    <div style={shapeStyle} onClick={handlePress}>
      {attr.text.text && (
        <div style={textContainerStyle}>
          <div style={textStyle}>{attr.text.text}</div>
        </div>
      )}
    </div>
  );
}
