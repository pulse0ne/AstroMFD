import type { JoystickAxis, SliderAttributes } from "@common/shared/models";
import { useCallback, useRef, useState, type CSSProperties } from "react";

import { hAlignmentMap, vAlignmentMap } from "./common.ts";
import { SvgRenderer } from "./SvgRenderer.tsx";

export type SliderProps = {
  attr: SliderAttributes;
  onAxisMove: (axis: JoystickAxis, value: number) => void;
};

export function Slider({ attr, onAxisMove }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const [position, setPosition] = useState(0.5);

  const { trackColor, activeColor, thumbColor, trackThickness, thumbSize } =
    attr.appearance;
  const isVertical = attr.orientation === "vertical";

  const sendValue = useCallback(
    (normalized: number) => {
      const { axis, min, max } = attr.axis;
      const scaled = min + normalized * (max - min);
      const clamped = Math.max(0, Math.min(1, scaled));
      onAxisMove(axis, clamped);
    },
    [attr.axis, onAxisMove],
  );

  const getNormalized = useCallback(
    (clientX: number, clientY: number): number => {
      const el = trackRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      if (isVertical) {
        const ratio = 1 - (clientY - rect.top) / rect.height;
        return Math.max(0, Math.min(1, ratio));
      }
      const ratio = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, ratio));
    },
    [isVertical],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      activeRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const normalized = getNormalized(e.clientX, e.clientY);
      setPosition(normalized);
      sendValue(normalized);
    },
    [getNormalized, sendValue],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeRef.current) return;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const normalized = getNormalized(e.clientX, e.clientY);
        setPosition(normalized);
        sendValue(normalized);
      });
    },
    [getNormalized, sendValue],
  );

  const handlePointerUp = useCallback(() => {
    activeRef.current = false;
  }, []);

  const padding = thumbSize + 4;

  const containerStyle: CSSProperties = {
    position: "absolute",
    left: attr.shape.position.x,
    top: attr.shape.position.y,
    width: attr.shape.size.width,
    height: attr.shape.size.height,
    touchAction: "none",
  };

  const trackAreaStyle: CSSProperties = {
    position: "absolute",
    left: isVertical ? "50%" : padding,
    top: isVertical ? padding : "50%",
    width: isVertical ? trackThickness : `calc(100% - ${padding * 2}px)`,
    height: isVertical ? `calc(100% - ${padding * 2}px)` : trackThickness,
    transform: isVertical ? "translateX(-50%)" : "translateY(-50%)",
    borderRadius: trackThickness / 2,
    backgroundColor: trackColor,
  };

  const pct = `${position * 100}%`;

  const activeTrackStyle: CSSProperties = {
    position: "absolute",
    borderRadius: trackThickness / 2,
    backgroundColor: activeColor,
    ...(isVertical
      ? { bottom: 0, left: 0, width: "100%", height: pct }
      : { top: 0, left: 0, height: "100%", width: pct }),
  };

  const thumbStyle: CSSProperties = {
    position: "absolute",
    width: thumbSize * 2,
    height: thumbSize * 2,
    borderRadius: "50%",
    backgroundColor: thumbColor,
    transform: "translate(-50%, -50%)",
    ...(isVertical
      ? { left: "50%", bottom: pct }
      : { top: "50%", left: pct }),
  };

  const textContainerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: vAlignmentMap[attr.text.verticalAlignment],
    alignItems: hAlignmentMap[attr.text.horizontalAlignment],
    pointerEvents: "none",
  };

  const textStyle: CSSProperties = {
    color: attr.text.fontColor ?? undefined,
    fontFamily: attr.text.font?.name,
    fontSize: attr.text.fontSize,
    userSelect: "none",
  };

  return (
    <div
      style={containerStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {attr.shape.svg && (
        <SvgRenderer
          svg={attr.shape.svg}
          width={attr.shape.size.width}
          height={attr.shape.size.height}
        />
      )}
      <div ref={trackRef} style={trackAreaStyle}>
        <div style={activeTrackStyle} />
        <div style={thumbStyle} />
      </div>
      {attr.text.text && (
        <div style={textContainerStyle}>
          <span style={textStyle}>{attr.text.text}</span>
        </div>
      )}
    </div>
  );
}
