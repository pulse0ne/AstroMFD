import {
  Color,
  Gradient,
  ShadowEffect,
  ShapeAttributes,
} from "@common/shared/models";
import { v4 as uuid } from "uuid";

import { useRecentColors } from "../../hooks/useRecentColors.ts";
import { gradientString } from "../../utils/gradientString.ts";
import { ColorSwatch } from "./ColorSwatch.tsx";
import { GradientPicker } from "./GradientPicker.tsx";
import { Toggle } from "./Toggle.tsx";

export type ShapeSectionProps = {
  shapeAttr: ShapeAttributes;
  pressedAttr?: Partial<ShapeAttributes>;
  isPressed?: boolean;
  onUpdate: (attr: ShapeAttributes, type: string) => void;
  onUpdatePressed?: (attr: Partial<ShapeAttributes>, type: string) => void;
};

export function ShapeSection({
  shapeAttr,
  pressedAttr,
  isPressed,
  onUpdate,
  onUpdatePressed,
}: ShapeSectionProps) {
  const { recentColors, addRecentColor } = useRecentColors();

  const handleStroke = (value: string) => {
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { stroke: value }),
        "widget.pressed.shape.stroke",
      );
    } else {
      onUpdate(
        Object.assign({}, shapeAttr, { stroke: value }),
        "widget.shape.stroke",
      );
    }
  };

  const handleFill = (type: Color["type"], value: Color["value"]) => {
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { fill: { type, value } }),
        "widget.pressed.shape.fill",
      );
    } else {
      onUpdate(
        Object.assign({}, shapeAttr, { fill: { type, value } }),
        "widget.shape.fill",
      );
    }
  };

  const handleFillTypeChange = () => {
    let newFill: Color;
    if (fill?.type === "solid") {
      newFill = {
        type: "gradient",
        value: {
          type: "linear",
          stops: [
            { id: uuid(), color: "white", position: 0 },
            { id: uuid(), color: "black", position: 100 },
          ],
        },
      };
    } else {
      newFill = {
        type: "solid",
        value: "gray",
      };
    }
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { fill: newFill }),
        "widget.pressed.shape.fill",
      );
    } else {
      onUpdate(
        Object.assign({}, shapeAttr, { fill: newFill }),
        "widget.shape.fill",
      );
    }
  };

  const handleNumericalChange = (
    key: "strokeWidth" | "cornerRadius",
    value: number,
  ) => {
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { [key]: value }),
        `widget.pressed.shape.${key}`,
      );
    } else {
      onUpdate(
        Object.assign({}, shapeAttr, { [key]: value }),
        `widget.shape.${key}`,
      );
    }
  };

  const handleShadowToggle = () => {
    const newShadowValue: ShadowEffect | null = Boolean(shadow)
      ? null
      : { color: "#000", strength: 3, xOffset: 0, yOffset: 0 };
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { shadow: newShadowValue }),
        "widget.pressed.shape.shadow",
      );
    } else {
      onUpdate(
        Object.assign({}, shapeAttr, { shadow: newShadowValue }),
        "widget.shape.shadow",
      );
    }
  };

  const handleShadowValue = (
    key: "strength" | "xOffset" | "yOffset",
    value: number,
  ) => {
    const newShadow: ShadowEffect = Object.assign({}, shadow, { [key]: value });
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { shadow: newShadow }),
        `widget.pressed.shape.shadow.${key}`,
      );
    } else {
      onUpdate(
        Object.assign({}, shapeAttr, { shadow: newShadow }),
        `widget.shape.shadow.${key}`,
      );
    }
  };

  const handleShadowColor = (value: string) => {
    const newShadow: ShadowEffect = Object.assign({}, shadow, { color: value });
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { shadow: newShadow }),
        "widget.pressed.shape.shadow.color",
      );
    } else {
      onUpdate(
        Object.assign({}, shapeAttr, { shadow: newShadow }),
        "widget.shape.shadow.color",
      );
    }
  };

  const fill =
    isPressed && pressedAttr?.fill ? pressedAttr.fill : shapeAttr.fill;
  const stroke =
    isPressed && pressedAttr?.stroke ? pressedAttr.stroke : shapeAttr.stroke;
  const strokeWidth =
    isPressed && pressedAttr?.strokeWidth
      ? pressedAttr.strokeWidth
      : shapeAttr.strokeWidth;
  const cornerRadius =
    isPressed && pressedAttr?.cornerRadius
      ? pressedAttr.cornerRadius
      : shapeAttr.cornerRadius;
  const shadow =
    isPressed && pressedAttr?.shadow ? pressedAttr.shadow : shapeAttr.shadow;

  const fillValue = !fill
    ? null
    : fill.type === "solid"
      ? (fill.value as string)
      : gradientString(fill.value as Gradient);

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>SHAPE</h5>
      <div className="col gap-16">
        <div className="row align-items-center gap-16">
          <span>Fill Type:</span>
          <Toggle
            onToggle={handleFillTypeChange}
            value={Boolean(fill) && fill?.type !== "solid"}
            leftLabel="Solid"
            rightLabel="Gradient"
          />
        </div>
        {fill?.type === "gradient" && (
          <GradientPicker
            value={fill.value as Gradient}
            onChange={(v) => handleFill("gradient", v)}
          />
        )}
        {!fill ||
          (fill?.type === "solid" && (
            <div className="row align-items-center gap-16">
              <span>Fill Color:</span>
              <ColorSwatch
                color={fillValue ?? undefined}
                recents={recentColors}
                onUpdate={(c) => handleFill("solid", c)}
                onAddRecentColor={addRecentColor}
              />
            </div>
          ))}
      </div>
      <div className="row align-items-center gap-16">
        <span style={{ width: 50 }}>Stroke:</span>
        <ColorSwatch
          color={stroke ?? undefined}
          recents={recentColors}
          onUpdate={(c) => handleStroke(c)}
          onAddRecentColor={addRecentColor}
        />
      </div>
      <div className="row align-items-center gap-16">
        <span style={{ width: 100 }}>Stroke Width:</span>
        <input
          type="number"
          min={0}
          style={{ width: 75 }}
          value={strokeWidth}
          onChange={(evt) =>
            handleNumericalChange(
              "strokeWidth",
              Number.parseInt(evt.target.value),
            )
          }
        />
      </div>
      <div className="row align-items-center gap-16">
        <span style={{ width: 100 }}>Corner Radius:</span>
        <input
          type="number"
          min={0}
          style={{ width: 75 }}
          value={cornerRadius}
          onChange={(evt) =>
            handleNumericalChange(
              "cornerRadius",
              Number.parseInt(evt.target.value),
            )
          }
        />
      </div>
      <div className="col gap-16">
        <div className="row gap-16 align-items-center">
          <span>Shadow:</span>
          <Toggle onToggle={handleShadowToggle} value={Boolean(shadow)} />
        </div>
        {shadow && (
          <div className="col gap-16">
            <div className="row gap-16">
              <span>Color:</span>
              <ColorSwatch
                color={shadow.color}
                recents={recentColors}
                onUpdate={handleShadowColor}
                onAddRecentColor={addRecentColor}
              />
            </div>
            <div className="row gap-16">
              <span>Strength:</span>
              <input
                type="number"
                min={0}
                step={1}
                value={shadow.strength}
                onChange={(evt) =>
                  handleShadowValue(
                    "strength",
                    Number.parseFloat(evt.target.value),
                  )
                }
              />
            </div>
            <div className="row gap-16">
              <span>x Offset:</span>
              <input
                type="number"
                min={0}
                step={1}
                value={shadow.xOffset}
                onChange={(evt) =>
                  handleShadowValue(
                    "xOffset",
                    Number.parseFloat(evt.target.value),
                  )
                }
              />
            </div>
            <div className="row gap-16">
              <span>y Offset:</span>
              <input
                type="number"
                min={0}
                step={1}
                value={shadow.yOffset}
                onChange={(evt) =>
                  handleShadowValue(
                    "yOffset",
                    Number.parseFloat(evt.target.value),
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
