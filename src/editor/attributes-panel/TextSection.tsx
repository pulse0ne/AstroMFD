import { ShadowEffect, TextAttributes } from "@common/shared/models";
import { ChangeEvent } from "react";
import {
  MdAlignHorizontalCenter,
  MdAlignHorizontalLeft,
  MdAlignHorizontalRight,
  MdAlignVerticalBottom,
  MdAlignVerticalCenter,
  MdAlignVerticalTop,
} from "react-icons/md";

import { BUNDLED_FONTS } from "../../utils/bundledFonts.ts";
import { useRecentColors } from "../../hooks/useRecentColors.ts";
import { CollapsibleSection } from "./CollapsibleSection.tsx";
import { ColorSwatch } from "./ColorSwatch.tsx";
import { Toggle } from "./Toggle.tsx";

import "./text-section.css";

export type TextSectionProps = {
  textAttr: TextAttributes;
  pressedAttr?: Partial<TextAttributes>;
  isPressed?: boolean;
  onUpdate: (attr: TextAttributes, type: string) => void;
  onUpdatePressed?: (attr: Partial<TextAttributes>, type: string) => void;
};

export function TextSection({
  textAttr,
  pressedAttr,
  isPressed,
  onUpdate,
  onUpdatePressed,
}: TextSectionProps) {
  const { recentColors, addRecentColor } = useRecentColors();

  const handleStringValueChange = (
    key: "text" | "fontColor",
    value: string,
  ) => {
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { [key]: value }),
        `widget.pressed.text.${key}`,
      );
    } else {
      onUpdate(
        Object.assign({}, textAttr, { [key]: value }),
        `widget.text.${key}`,
      );
    }
  };

  const handleFontValueChange = (value: string) => {
    const font = value ? { name: value } : null;
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { font }),
        "widget.pressed.text.font",
      );
    } else {
      onUpdate(
        Object.assign({}, textAttr, { font }),
        "widget.text.font",
      );
    }
  };

  const handleFontSizeChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(evt.target.value);
    if (!isNaN(value)) {
      if (isPressed && onUpdatePressed) {
        onUpdatePressed(
          Object.assign({}, pressedAttr, { fontSize: value }),
          "widget.pressed.text.fontSize",
        );
      } else {
        onUpdate(
          Object.assign({}, textAttr, { fontSize: value }),
          "widget.text.fontSize",
        );
      }
    }
  };

  const handleAlignmentChange = (
    value:
      | TextAttributes["horizontalAlignment"]
      | TextAttributes["verticalAlignment"],
  ) => {
    const key = ["left", "center", "right"].includes(value)
      ? "horizontalAlignment"
      : "verticalAlignment";
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { [key]: value }),
        "widget.pressed.text.alignment",
      );
    } else {
      onUpdate(
        Object.assign({}, textAttr, { [key]: value }),
        "widget.text.alignment",
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
        "widget.pressed.text.shadow",
      );
    } else {
      onUpdate(
        Object.assign({}, textAttr, { shadow: newShadowValue }),
        "widget.text.shadow",
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
        `widget.pressed.text.shadow.${key}`,
      );
    } else {
      onUpdate(
        Object.assign({}, textAttr, { shadow: newShadow }),
        `widget.text.shadow.${key}`,
      );
    }
  };

  const handleShadowColor = (value: string) => {
    const newShadow: ShadowEffect = Object.assign({}, shadow, { color: value });
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(
        Object.assign({}, pressedAttr, { shadow: newShadow }),
        "widget.pressed.text.shadow.color",
      );
    } else {
      onUpdate(
        Object.assign({}, textAttr, { shadow: newShadow }),
        "widget.text.shadow.color",
      );
    }
  };

  const vAlignment =
    isPressed && pressedAttr?.verticalAlignment
      ? pressedAttr.verticalAlignment
      : textAttr.verticalAlignment;
  const hAlignment =
    isPressed && pressedAttr?.horizontalAlignment
      ? pressedAttr.horizontalAlignment
      : textAttr.horizontalAlignment;
  const textValue = (isPressed ? pressedAttr?.text : textAttr.text) ?? "";
  const fontValue =
    (isPressed ? pressedAttr?.font?.name : textAttr.font?.name) ?? "";
  const fontColor =
    (isPressed ? pressedAttr?.fontColor : textAttr.fontColor) ?? undefined;
  const fontSize =
    isPressed && pressedAttr?.fontSize
      ? pressedAttr.fontSize
      : textAttr.fontSize;
  const shadow =
    isPressed && pressedAttr?.shadow ? pressedAttr.shadow : textAttr.shadow;

  return (
    <CollapsibleSection title="Text">
      <div className="row align-items-center gap-16">
        <span>Label:</span>
        <textarea
          className="text-textarea"
          value={textValue}
          onChange={(evt) => handleStringValueChange("text", evt.target.value)}
        />
      </div>
      <div className="row align-items-center gap-16">
        <span>Font:</span>
        <select
          id="font-select"
          value={fontValue}
          onChange={(evt) => handleFontValueChange(evt.target.value)}
        >
          <option value="">Default</option>
          {BUNDLED_FONTS.map((font) => (
            <option
              key={font.name}
              value={font.name}
              style={{ fontFamily: font.name }}
            >
              {font.name}
            </option>
          ))}
        </select>
      </div>
      <div className="row align-items-center gap-16">
        <span>Color:</span>
        <ColorSwatch
          color={fontColor}
          recents={recentColors}
          onUpdate={(color) => handleStringValueChange("fontColor", color)}
          onAddRecentColor={addRecentColor}
        />
      </div>
      <div className="row align-items-center gap-16">
        <span>Size:</span>
        <input
          type="number"
          min={5}
          value={fontSize}
          onChange={handleFontSizeChange}
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
      <div className="row align-items-center gap-16">
        <span style={{ width: 140 }}>Horizontal Alignment:</span>
        <MdAlignHorizontalLeft
          className="pointer"
          size={16}
          style={{
            color: hAlignment === "left" ? "var(--gradient-stop1)" : undefined,
          }}
          onClick={() => handleAlignmentChange("left")}
        />
        <MdAlignHorizontalCenter
          className="pointer"
          size={16}
          style={{
            color:
              hAlignment === "center" ? "var(--gradient-stop1)" : undefined,
          }}
          onClick={() => handleAlignmentChange("center")}
        />
        <MdAlignHorizontalRight
          className="pointer"
          size={16}
          style={{
            color: hAlignment === "right" ? "var(--gradient-stop1)" : undefined,
          }}
          onClick={() => handleAlignmentChange("right")}
        />
      </div>
      <div className="row align-items-center gap-16">
        <span style={{ width: 140 }}>Vertical Alignment:</span>
        <MdAlignVerticalTop
          className="pointer"
          size={16}
          style={{
            color: vAlignment === "top" ? "var(--gradient-stop1)" : undefined,
          }}
          onClick={() => handleAlignmentChange("top")}
        />
        <MdAlignVerticalCenter
          className="pointer"
          size={16}
          style={{
            color:
              vAlignment === "middle" ? "var(--gradient-stop1)" : undefined,
          }}
          onClick={() => handleAlignmentChange("middle")}
        />
        <MdAlignVerticalBottom
          className="pointer"
          size={16}
          style={{
            color:
              vAlignment === "bottom" ? "var(--gradient-stop1)" : undefined,
          }}
          onClick={() => handleAlignmentChange("bottom")}
        />
      </div>
    </CollapsibleSection>
  );
}
