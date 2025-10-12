import {type CSSProperties, useCallback, useState} from "react";
import type {ButtonAttributes, ShadowEffect} from "@common/shared/models";
import {hAlignmentMap, vAlignmentMap} from "./common.ts";

// TODO: remove;; just a test
const audio = new Audio("/audio/resources/Flip.mp3");

function playSound() {
  audio.currentTime = 0;
  audio.play().catch(e => console.error(e));
}

export type ButtonProps = {
  attr: ButtonAttributes;
  onPress: (button: number, duration: number) => void;
  onDown: (button: number) => void;
  onUp: (button: number) => void;
  onNavigate: (target: string) => void;
};

export function Button({ attr, onPress, onDown, onUp, onNavigate }: ButtonProps) {
  const [ pressed, setPressed ] = useState(false);

  const shapeStyle: CSSProperties = {
    position: "absolute",
    left: (pressed && attr.pressed.shape.position?.x) ? attr.pressed.shape.position.x : attr.shape.position.x,
    top: (pressed && attr.pressed.shape.position?.y) ? attr.pressed.shape.position.y : attr.shape.position.y,
    width: (pressed && attr.pressed.shape.size?.width) ? attr.pressed.shape.size.width : attr.shape.size.width,
    height: (pressed && attr.pressed.shape.size?.height) ? attr.pressed.shape.size.height : attr.shape.size.height,
    backgroundColor: (pressed && attr.pressed.shape.fill) ? attr.pressed.shape.fill : attr.shape.fill ?? "transparent",
    borderWidth: (pressed && attr.pressed.shape.strokeWidth) ? attr.pressed.shape.strokeWidth : attr.shape.strokeWidth,
    borderStyle: "solid",
    borderColor: (pressed && attr.pressed.shape.stroke) ? attr.pressed.shape.stroke : attr.shape.stroke ?? "transparent",
    borderRadius: (pressed && attr.pressed.shape.cornerRadius) ? attr.pressed.shape.cornerRadius : attr.shape.cornerRadius,
    boxShadow: (pressed && attr.pressed.shape.shadow) ? getShadow(attr.pressed.shape.shadow) : (attr.shape.shadow ? getShadow(attr.shape.shadow) : undefined),
  };

  const textContainerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: vAlignmentMap[attr.text.verticalAlignment],
    alignItems: hAlignmentMap[attr.text.horizontalAlignment],
  };

  const textStyle: CSSProperties = {
    color: (pressed && attr.pressed.text.fontColor) ? attr.pressed.text.fontColor : attr.text.fontColor ?? undefined,
    fontFamily: (pressed && attr.pressed.text.font?.name) ? attr.pressed.text.font.name : attr.text.font?.name,
    fontSize: (pressed && attr.pressed.text.fontSize) ? attr.pressed.text.fontSize : attr.text.fontSize,
    textShadow: (pressed && attr.pressed.text.shadow) ? getShadow(attr.pressed.text.shadow) : (attr.text.shadow ? getShadow(attr.text.shadow) : undefined),
    userSelect: "none",
  };

  const handlePress = useCallback(() => {
    if (attr.buttonType === "action" || attr.buttonType === "toggle") {
      const {button, fixedDuration, duration} = attr.vjoyButton;
      if (fixedDuration) {
        onPress(button, duration);
      }
    } else if (attr.buttonType === "navigation" && attr.navTarget) {
      onNavigate(attr.navTarget);
    }
  }, [attr]);

  const handleDown = useCallback(() => {
    playSound();
    if (attr.buttonType === "toggle") {
      setPressed(ov => !ov);
    } else {
      setPressed(true);
    }
    if (!attr.vjoyButton.fixedDuration && attr.buttonType !== "navigation") {
      onDown(attr.vjoyButton.button);
    }
  }, [attr]);

  const handleUp = useCallback(() => {
    if (attr.buttonType !== "toggle") {
      setPressed(false);
    }
    if (!attr.vjoyButton.fixedDuration && attr.buttonType !== "navigation") {
      onUp(attr.vjoyButton.button);
    }
  }, [attr]);

  return (
    <div
      style={shapeStyle}
      onClick={handlePress}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
    >
      {attr.text.text && (
        <div style={textContainerStyle}>
          <div style={textStyle}>{attr.text.text}</div>
        </div>
      )}
    </div>
  );
}

function getShadow(shadow: ShadowEffect) {
  const x = shadow.xOffset;
  const y = shadow.yOffset;
  const c = shadow.color;
  const s = shadow.strength;
  const o = `${x}px ${y}px`;
  return `${o} ${s}px ${c}, ${o} ${s * 3}px ${c}, ${o} ${s * 6}px ${c}`;
}
