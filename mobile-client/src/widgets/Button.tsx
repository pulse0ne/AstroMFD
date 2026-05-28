import type {
  ActionStep,
  ButtonAttributes,
  Gradient,
  InputKey,
  ShadowEffect,
} from "@common/shared/models";
import { useCallback, useMemo, useState, type CSSProperties } from "react";

import { gradientString } from "../utils.ts";
import { hAlignmentMap, vAlignmentMap } from "./common.ts";
import { IconRenderer } from "./IconRenderer.tsx";
import { SvgRenderer } from "./SvgRenderer.tsx";

export type ButtonProps = {
  attr: ButtonAttributes;
  onExecuteActions: (steps: ActionStep[]) => void;
  onDown: (key: InputKey) => void;
  onUp: (key: InputKey) => void;
  onNavigate: (target: string) => void;
};

export function Button({
  attr,
  onExecuteActions,
  onDown,
  onUp,
  onNavigate,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const fill = useMemo(() => {
    const f =
      pressed && attr.pressed.shape.fill
        ? attr.pressed.shape.fill
        : attr.shape.fill;
    if (!f) return null;
    if (f.type === "solid") {
      return f.value as string;
    } else if (f.type === "gradient") {
      return gradientString(f.value as Gradient);
    }
    return null;
  }, [attr, pressed]);

  const hasSvg = Boolean(attr.shape.svg);

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
    background: hasSvg ? undefined : (fill ?? "transparent"),
    borderWidth: hasSvg
      ? undefined
      : pressed && attr.pressed.shape.strokeWidth
        ? attr.pressed.shape.strokeWidth
        : attr.shape.strokeWidth,
    borderStyle: hasSvg ? undefined : "solid",
    borderColor: hasSvg
      ? undefined
      : pressed && attr.pressed.shape.stroke
        ? attr.pressed.shape.stroke
        : (attr.shape.stroke ?? "transparent"),
    borderRadius: hasSvg
      ? undefined
      : pressed && attr.pressed.shape.cornerRadius
        ? attr.pressed.shape.cornerRadius
        : attr.shape.cornerRadius,
    boxShadow: hasSvg
      ? undefined
      : pressed && attr.pressed.shape.shadow
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

  const firstKey = useMemo(() => {
    const first = attr.input.steps[0];
    if (!first) return null;
    if (
      first.type === "press" ||
      first.type === "keyDown" ||
      first.type === "keyUp"
    ) {
      return first.key;
    }
    return null;
  }, [attr.input.steps]);

  const handlePress = useCallback(() => {
    if (attr.buttonType === "action") {
      onExecuteActions(attr.input.steps);
    } else if (attr.buttonType === "navigation" && attr.navTarget) {
      onNavigate(attr.navTarget);
    }
  }, [attr, onExecuteActions, onNavigate]);

  const handleDown = useCallback(() => {
    // TODO: not supported in iOS
    // TODO: maybe make configurable if we bring it back
    // navigator.vibrate?.(20);

    if (attr.buttonType === "toggle") {
      setPressed((ov) => !ov);
    } else {
      setPressed(true);
    }
    if (attr.buttonType === "toggle" && firstKey) {
      onDown(firstKey);
    }
  }, [attr, firstKey, onDown]);

  const handleUp = useCallback(() => {
    if (attr.buttonType !== "toggle") {
      setPressed(false);
    }
    if (attr.buttonType === "toggle" && firstKey) {
      onUp(firstKey);
    }
  }, [attr, firstKey, onUp]);

  return (
    <div
      style={shapeStyle}
      onClick={handlePress}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
    >
      {attr.shape.svg && (
        <SvgRenderer
          svg={attr.shape.svg}
          width={attr.shape.size.width}
          height={attr.shape.size.height}
        />
      )}
      {attr.icon && (
        <IconRenderer
          icon={attr.icon}
          containerWidth={attr.shape.size.width}
          containerHeight={attr.shape.size.height}
        />
      )}
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
