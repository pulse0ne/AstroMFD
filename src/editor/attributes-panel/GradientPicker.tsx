import { Gradient, GradientStop } from "@common/shared/models";
import React, { useRef, useState } from "react";
import { v4 as uuid } from "uuid";

import { gradientString } from "../../utils/gradientString.ts";
import { ColorSwatch } from "./ColorSwatch";

import "./gradient-picker.css";

const defaultGradient = () => {
  return {
    type: "linear",
    stops: [
      {
        id: uuid(),
        color: "#000",
        position: 0,
      },
      {
        id: uuid(),
        color: "#fff",
        position: 100,
      },
    ],
  } as Gradient;
};

export type GradientPickerProps = {
  value?: Gradient;
  onChange: (gradient: Gradient) => void;
};

export function GradientPicker({ value, onChange }: GradientPickerProps) {
  const [activeStop, setActiveStop] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const gradient = value ?? defaultGradient();
  const gradientCSS = gradientString(gradient);

  const updateGradientStops = (nextStops: GradientStop[]) => {
    const newGradient: Gradient = { ...gradient, stops: nextStops };
    onChange(newGradient);
  };

  const toggleType = () => {
    const nextType = gradient.type === "linear" ? "radial" : "linear";
    onChange({ type: nextType, stops: [...gradient.stops] });
  };

  const handleBarClick = (e: React.MouseEvent) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = ((e.clientX - rect.left) / rect.width) * 100;
    const newStop: GradientStop = {
      id: uuid(),
      color: "rgba(0, 0, 0, 1)",
      position: Math.min(100, Math.max(0, pos)),
    };
    updateGradientStops(
      [...gradient.stops, newStop].sort((a, b) => a.position - b.position),
    );
    setActiveStop(newStop.id);
  };

  const handleDrag = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    setActiveStop(id);
    const onMove = (moveEvt: MouseEvent) => {
      const dx = moveEvt.clientX - rect.left;
      const pos = (dx / rect.width) * 100;
      updateGradientStops(
        gradient.stops
          .map((s) =>
            s.id === id
              ? { ...s, position: Math.min(100, Math.max(0, pos)) }
              : s,
          )
          .sort((a, b) => a.position - b.position),
      );
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleRightClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (gradient.stops.length > 2) {
      onChange({
        ...gradient,
        stops: gradient.stops.filter((s) => s.id !== id),
      });
    }
  };

  const handleAngleChange = (newAngle: number) => {
    if (!isNaN(newAngle)) {
      onChange({ ...gradient, angle: newAngle });
    }
  };

  const updateStopColor = (id: string, newColor: string) => {
    updateGradientStops(
      gradient.stops.map((s) => (s.id === id ? { ...s, color: newColor } : s)),
    );
  };

  return (
    <div className="gradient-picker">
      <div className="gradient-type-toggle">
        <button
          onClick={toggleType}
          className={gradient.type === "linear" ? "active" : ""}
        >
          Linear
        </button>
        <button
          onClick={toggleType}
          className={gradient.type === "radial" ? "active" : ""}
        >
          Radial
        </button>
      </div>

      {gradient.type === "linear" && (
        <div className="row gap-16">
          <span>Angle:</span>
          <input
            type="range"
            step={5}
            min={-180}
            max={180}
            value={gradient.angle ?? 0}
            onChange={(e) => handleAngleChange(parseInt(e.target.value))}
          />
          {gradient.angle ?? 0}&deg;
        </div>
      )}

      <div
        className="gradient-bar"
        ref={barRef}
        onDoubleClick={handleBarClick}
        onContextMenu={(e) => e.preventDefault()}
        style={{ background: gradientCSS }}
      >
        {gradient.stops.map((s) => (
          <div
            key={s.id}
            className={`stop-handle ${activeStop === s.id ? "active" : ""}`}
            style={{ left: `${s.position}%`, background: s.color }}
            onMouseDown={(e) => handleDrag(s.id, e)}
            onContextMenu={(e) => handleRightClick(s.id, e)}
          />
        ))}
      </div>

      <div className="row gap-16 align-items-center">
        <span>Stop Color:</span>
        {activeStop && (
          <div className="stop-editor">
            <ColorSwatch
              color={
                gradient.stops.find((s) => s.id === activeStop)?.color ?? ""
              }
              recents={[]}
              onUpdate={(c) => updateStopColor(activeStop, c)}
              onAddRecentColor={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
