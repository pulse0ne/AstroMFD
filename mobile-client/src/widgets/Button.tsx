import type {
  ButtonAttributes,
  Gradient,
  InputKey,
  ShadowEffect,
} from "@common/shared/models";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { gradientString } from "../utils.ts";
import { hAlignmentMap, vAlignmentMap } from "./common.ts";

export type ButtonProps = {
  attr: ButtonAttributes;
  onPress: (key: InputKey, duration: number) => void;
  onDown: (key: InputKey) => void;
  onUp: (key: InputKey) => void;
  onNavigate: (target: string) => void;
};

export function Button({
  attr,
  onPress,
  onDown,
  onUp,
  onNavigate,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio if sound is configured
  useMemo(() => {
    if (
      attr.sound &&
      (attr.sound.playOn === "mobile" || attr.sound.playOn === "both")
    ) {
      const audioPath = `/audio/${attr.sound.source}/${attr.sound.file}`;
      audioRef.current = new Audio(audioPath);
    } else {
      audioRef.current = null;
    }
  }, [attr.sound]);

  const fill = useMemo(() => {
    const f =
      pressed && attr.pressed.shape.fill
        ? attr.pressed.shape.fill
        : attr.shape.fill;
    console.log(f);
    if (!f) return null;
    if (f.type === "solid") {
      return f.value as string;
    } else if (f.type === "gradient") {
      return gradientString(f.value as Gradient);
    }
    return null;
  }, [attr, pressed]);

  const shapeStyle: CSSProperties = {
    position: "absolute",
    left:
      pressed && attr.pressed.shape.position?.x
        ? attr.pressed.shape.position.x
        : attr.shape.position.x,
    top:
      pressed && attr.pressed.shape.position?.y
        ? attr.pressed.shape.position.y
        : attr.shape.position.y,
    width:
      pressed && attr.pressed.shape.size?.width
        ? attr.pressed.shape.size.width
        : attr.shape.size.width,
    height:
      pressed && attr.pressed.shape.size?.height
        ? attr.pressed.shape.size.height
        : attr.shape.size.height,
    background: fill ?? "transparent",
    borderWidth:
      pressed && attr.pressed.shape.strokeWidth
        ? attr.pressed.shape.strokeWidth
        : attr.shape.strokeWidth,
    borderStyle: "solid",
    borderColor:
      pressed && attr.pressed.shape.stroke
        ? attr.pressed.shape.stroke
        : (attr.shape.stroke ?? "transparent"),
    borderRadius:
      pressed && attr.pressed.shape.cornerRadius
        ? attr.pressed.shape.cornerRadius
        : attr.shape.cornerRadius,
    boxShadow:
      pressed && attr.pressed.shape.shadow
        ? getShadow(attr.pressed.shape.shadow)
        : attr.shape.shadow
          ? getShadow(attr.shape.shadow)
          : undefined,
  };

  const textContainerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: vAlignmentMap[attr.text.verticalAlignment],
    alignItems: hAlignmentMap[attr.text.horizontalAlignment],
  };

  const textStyle: CSSProperties = {
    color:
      pressed && attr.pressed.text.fontColor
        ? attr.pressed.text.fontColor
        : (attr.text.fontColor ?? undefined),
    fontFamily:
      pressed && attr.pressed.text.font?.name
        ? attr.pressed.text.font.name
        : attr.text.font?.name,
    fontSize:
      pressed && attr.pressed.text.fontSize
        ? attr.pressed.text.fontSize
        : attr.text.fontSize,
    textShadow:
      pressed && attr.pressed.text.shadow
        ? getShadow(attr.pressed.text.shadow)
        : attr.text.shadow
          ? getShadow(attr.text.shadow)
          : undefined,
    userSelect: "none",
  };

  const handlePress = useCallback(() => {
    if (attr.buttonType === "action" || attr.buttonType === "toggle") {
      const { key, fixedDuration, duration } = attr.input;
      if (fixedDuration) {
        onPress(key, duration);
      }
    } else if (attr.buttonType === "navigation" && attr.navTarget) {
      onNavigate(attr.navTarget);
    }
  }, [attr, onPress, onNavigate]);

  const handleDown = useCallback(() => {
    // Play sound if configured
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.error("Failed to play sound:", e));
    }

    if (attr.buttonType === "toggle") {
      setPressed((ov) => !ov);
    } else {
      setPressed(true);
    }
    if (!attr.input.fixedDuration && attr.buttonType !== "navigation") {
      onDown(attr.input.key);
    }
  }, [attr, onDown]);

  const handleUp = useCallback(() => {
    if (attr.buttonType !== "toggle") {
      setPressed(false);
    }
    if (!attr.input.fixedDuration && attr.buttonType !== "navigation") {
      onUp(attr.input.key);
    }
  }, [attr, onUp]);

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
