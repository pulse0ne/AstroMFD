import {
  JoystickAxis,
  SliderAttributes,
  SliderOrientation,
} from "@common/shared/models";

import { useRecentColors } from "../../hooks/useRecentColors.ts";
import { ColorSwatch } from "./ColorSwatch.tsx";

export type SliderSpecificsSectionProps = {
  attr: SliderAttributes;
  onUpdate: (attr: SliderAttributes, type: string) => void;
};

const AXES: Array<{ value: JoystickAxis; label: string }> = [
  { value: "x", label: "X" },
  { value: "y", label: "Y" },
  { value: "z", label: "Z" },
  { value: "rx", label: "RX" },
  { value: "ry", label: "RY" },
  { value: "rz", label: "RZ" },
  { value: "slider1", label: "Slider 1" },
  { value: "slider2", label: "Slider 2" },
];

export function SliderSpecificsSection({
  attr,
  onUpdate,
}: SliderSpecificsSectionProps) {
  const { recentColors, addRecentColor } = useRecentColors();

  const handleOrientationChange = (orientation: SliderOrientation) => {
    onUpdate({ ...attr, orientation }, "widget.slider.orientation");
  };

  const handleAxisChange = (axis: JoystickAxis) => {
    onUpdate({ ...attr, axis: { ...attr.axis, axis } }, "widget.slider.axis");
  };

  const handleMinChange = (min: number) => {
    onUpdate({ ...attr, axis: { ...attr.axis, min } }, "widget.slider.min");
  };

  const handleMaxChange = (max: number) => {
    onUpdate({ ...attr, axis: { ...attr.axis, max } }, "widget.slider.max");
  };

  const handleAppearanceColor = (
    key: "trackColor" | "activeColor" | "thumbColor",
    value: string,
  ) => {
    onUpdate(
      { ...attr, appearance: { ...attr.appearance, [key]: value } },
      `widget.slider.appearance.${key}`,
    );
  };

  const handleAppearanceNumber = (
    key: "trackThickness" | "thumbSize",
    value: number,
  ) => {
    onUpdate(
      { ...attr, appearance: { ...attr.appearance, [key]: value } },
      `widget.slider.appearance.${key}`,
    );
  };

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>SLIDER</h5>
      <div className="row gap-16">
        <span>Orientation:</span>
        <select
          value={attr.orientation}
          onChange={(e) =>
            handleOrientationChange(e.target.value as SliderOrientation)
          }
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>
      <div className="row gap-16">
        <span>Axis:</span>
        <select
          value={attr.axis.axis}
          onChange={(e) => handleAxisChange(e.target.value as JoystickAxis)}
        >
          {AXES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="row gap-16 align-items-center">
        <span>Min:</span>
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={attr.axis.min}
          onChange={(e) => handleMinChange(Number(e.target.value))}
        />
      </div>
      <div className="row gap-16 align-items-center">
        <span>Max:</span>
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={attr.axis.max}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
        />
      </div>

      <h5 style={{ marginTop: 8 }}>APPEARANCE</h5>
      <div className="row gap-16 align-items-center">
        <span style={{ width: 100 }}>Track:</span>
        <ColorSwatch
          color={attr.appearance.trackColor}
          recents={recentColors}
          onUpdate={(c) => handleAppearanceColor("trackColor", c)}
          onAddRecentColor={addRecentColor}
        />
      </div>
      <div className="row gap-16 align-items-center">
        <span style={{ width: 100 }}>Active:</span>
        <ColorSwatch
          color={attr.appearance.activeColor}
          recents={recentColors}
          onUpdate={(c) => handleAppearanceColor("activeColor", c)}
          onAddRecentColor={addRecentColor}
        />
      </div>
      <div className="row gap-16 align-items-center">
        <span style={{ width: 100 }}>Thumb:</span>
        <ColorSwatch
          color={attr.appearance.thumbColor}
          recents={recentColors}
          onUpdate={(c) => handleAppearanceColor("thumbColor", c)}
          onAddRecentColor={addRecentColor}
        />
      </div>
      <div className="row gap-16 align-items-center">
        <span style={{ width: 100 }}>Track Width:</span>
        <input
          type="number"
          min={1}
          max={30}
          step={1}
          style={{ width: 60 }}
          value={attr.appearance.trackThickness}
          onChange={(e) =>
            handleAppearanceNumber("trackThickness", Number(e.target.value))
          }
        />
      </div>
      <div className="row gap-16 align-items-center">
        <span style={{ width: 100 }}>Thumb Size:</span>
        <input
          type="number"
          min={4}
          max={30}
          step={1}
          style={{ width: 60 }}
          value={attr.appearance.thumbSize}
          onChange={(e) =>
            handleAppearanceNumber("thumbSize", Number(e.target.value))
          }
        />
      </div>
    </div>
  );
}
