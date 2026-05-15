import type { JoystickAxis, SliderAttributes } from "@common/shared/models";
import { useCallback, useRef, type CSSProperties } from "react";

import { hAlignmentMap, vAlignmentMap } from "./common.ts";

export type SliderProps = {
  attr: SliderAttributes;
  onAxisMove: (axis: JoystickAxis, value: number) => void;
};

export function Slider({ attr, onAxisMove }: SliderProps) {
  const lastSentRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const sendValue = useCallback(
    (normalized: number) => {
      const { axis, min, max } = attr.axis;
      const scaled = min + normalized * (max - min);
      const clamped = Math.max(0, Math.min(1, scaled));
      onAxisMove(axis, clamped);
    },
    [attr.axis, onAxisMove],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const normalized = Number(e.target.value) / 1000;

      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        lastSentRef.current = normalized;
        sendValue(normalized);
      });
    },
    [sendValue],
  );

  const shapeStyle: CSSProperties = {
    position: "absolute",
    left: attr.shape.position.x,
    top: attr.shape.position.y,
    width: attr.shape.size.width,
    height: attr.shape.size.height,
    display: "flex",
    flexDirection: attr.orientation === "vertical" ? "column" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  const inputStyle: CSSProperties = {
    writingMode: attr.orientation === "vertical" ? "vertical-lr" : undefined,
    direction: attr.orientation === "vertical" ? "rtl" : undefined,
    width: attr.orientation === "horizontal" ? "80%" : undefined,
    height: attr.orientation === "vertical" ? "80%" : undefined,
    accentColor: attr.shape.stroke ?? undefined,
  };

  const textContainerStyle: CSSProperties = {
    display: "flex",
    justifyContent: vAlignmentMap[attr.text.verticalAlignment],
    alignItems: hAlignmentMap[attr.text.horizontalAlignment],
  };

  const textStyle: CSSProperties = {
    color: attr.text.fontColor ?? undefined,
    fontFamily: attr.text.font?.name,
    fontSize: attr.text.fontSize,
    userSelect: "none",
  };

  return (
    <div style={shapeStyle}>
      {attr.text.text && (
        <div style={textContainerStyle}>
          <span style={textStyle}>{attr.text.text}</span>
        </div>
      )}
      <input
        type="range"
        min={0}
        max={1000}
        defaultValue={0}
        style={inputStyle}
        onInput={handleInput}
      />
    </div>
  );
}
