import React, { useState, useRef } from "react";
import { ColorSwatch } from "./ColorSwatch";
import { v4 as uuid } from "uuid";
import {Gradient, GradientStop} from "@common/shared/models";
import {gradientString} from "../../utils/gradientString.ts";
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
      }
    ]
  } as Gradient;
};

export type GradientPickerProps = {
  value?: Gradient;
  onChange: (gradient: Gradient) => void;
};

export function GradientPicker({ value, onChange }: GradientPickerProps) {
  // const [gradient, setGradient] = useState<Gradient>(value ?? defaultGradient());
  const [activeStop, setActiveStop] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const gradient = value ?? defaultGradient();

  const gradientCSS = gradientString(gradient);
  console.log(gradientCSS);

  const updateGradientStops = (nextStops: GradientStop[]) => {
    const newGradient: Gradient = { ...gradient, stops: nextStops };
    // setGradient(newGradient);
    onChange(newGradient);
  };

  const toggleType = () => {
    const nextType = gradient.type === "linear" ? "radial" : "linear";
    // setGradient({ type: nextType, stops: [...gradient.stops] });
    onChange({ type: nextType, stops: [...gradient.stops ]});
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
    updateGradientStops([...gradient.stops, newStop].sort((a, b) => a.position - b.position));
    setActiveStop(newStop.id);
  };

  const handleDrag = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    // const startX = e.clientX;
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    const onMove = (moveEvt: MouseEvent) => {
      const dx = moveEvt.clientX - rect.left;
      const pos = (dx / rect.width) * 100;
      updateGradientStops(
        gradient.stops.map((s) =>
          s.id === id
            ? { ...s, position: Math.min(100, Math.max(0, pos)) }
            : s
        )
      );
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const updateStopColor = (id: string, newColor: string) => {
    updateGradientStops(gradient.stops.map((s) => (s.id === id ? { ...s, color: newColor } : s)));
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

      <div
        className="gradient-bar"
        ref={barRef}
        onDoubleClick={handleBarClick}
        style={{ background: gradientCSS }}
      >
        {gradient.stops.map((s) => (
          <div
            key={s.id}
            className={`stop-handle ${activeStop === s.id ? "active" : ""}`}
            style={{ left: `${s.position}%`, background: s.color }}
            onMouseDown={(e) => handleDrag(s.id, e)}
            onClick={(e) => {
              e.stopPropagation();
              setActiveStop(s.id);
            }}
          />
        ))}
      </div>

      {activeStop && (
        <div className="stop-editor">
          <ColorSwatch
            color={gradient.stops.find((s) => s.id === activeStop)?.color ?? ""}
            recents={[]}
            onUpdate={(c) => updateStopColor(activeStop, c)}
            onAddRecentColor={() => {}}
          />
        </div>
      )}
    </div>
  );
}
