import {FontSpec, TextAttributes} from "@common/shared/models";
import {ChangeEvent, useMemo} from "react";
import {ColorSwatch} from "./ColorSwatch.tsx";
import {
  MdAlignHorizontalCenter,
  MdAlignHorizontalLeft,
  MdAlignHorizontalRight, MdAlignVerticalBottom, MdAlignVerticalCenter,
  MdAlignVerticalTop
} from "react-icons/md";
import {useRecentColors} from "../../hooks/useRecentColors.ts";

export type TextSectionProps = {
  textAttr: TextAttributes;
  pressedAttr?: Partial<TextAttributes>;
  isPressed?: boolean;
  onUpdate: (attr: TextAttributes, type: string) => void;
  onUpdatePressed?: (attr: Partial<TextAttributes>, type: string) => void;
  fonts: FontSpec[];
};

export function TextSection({ textAttr, pressedAttr, isPressed, fonts, onUpdate, onUpdatePressed }: TextSectionProps) {
  const { recentColors, addRecentColor } = useRecentColors();

  const fontMap = useMemo(() => {
    return fonts.reduce((acc, font) => {
      acc[font.postscriptName] = font;
      return acc;
    }, {} as Record<string, FontSpec>);
  }, [fonts]);

  const handleStringValueChange = (key: "text"|"fontColor", value: string) => {
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(Object.assign({}, pressedAttr, {[key]: value}), `widget.pressed.text.${key}`);
    } else {
      onUpdate(Object.assign({}, textAttr, {[key]: value}), `widget.text.${key}`);
    }
  };

  const handleFontValueChange = (value: string) => {
    const fontSpec = fontMap[value];
    if (fontSpec) {
      if (isPressed && onUpdatePressed) {
        onUpdatePressed(Object.assign({}, pressedAttr, {font: fontSpec}), "widget.pressed.text.font");
      } else {
        onUpdate(Object.assign({}, textAttr, {font: fontSpec}), "widget.text.font");
      }
    }
  };

  const handleFontSizeChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(evt.target.value);
    if (!isNaN(value)) {
      if (isPressed && onUpdatePressed) {
        onUpdatePressed(Object.assign({}, pressedAttr, {fontSize: value}), "widget.pressed.text.fontSize");
      } else {
        onUpdate(Object.assign({}, textAttr, {fontSize: value}), "widget.text.fontSize");
      }
    }
  };

  const handleAlignmentChange = (value: TextAttributes["horizontalAlignment"] | TextAttributes["verticalAlignment"]) => {
    const key = ["left", "center", "right"].includes(value) ? "horizontalAlignment" : "verticalAlignment";
    if (isPressed && onUpdatePressed) {
      onUpdatePressed(Object.assign({}, pressedAttr, { [key]: value }), "widget.pressed.text.alignment");
    } else {
      onUpdate(Object.assign({}, textAttr, { [key]: value }), "widget.text.alignment");
    }
  };

  const vAlignment = (isPressed && pressedAttr?.verticalAlignment) ? pressedAttr.verticalAlignment : textAttr.verticalAlignment;
  const hAlignment = (isPressed && pressedAttr?.horizontalAlignment) ? pressedAttr.horizontalAlignment : textAttr.horizontalAlignment;
  const textValue = (isPressed ? pressedAttr?.text : textAttr.text) ?? "";
  const fontValue = (isPressed ? pressedAttr?.font?.postscriptName : textAttr.font?.postscriptName) ?? "";
  const fontColor = (isPressed ? pressedAttr?.fontColor : textAttr.fontColor) ?? undefined;
  const fontSize = (isPressed && pressedAttr?.fontSize) ? pressedAttr.fontSize : textAttr.fontSize;

  return (
    <div className="attribute-section col gap-16" style={{paddingTop: 16}}>
      <h5>TEXT</h5>
      <div className="row align-center gap-16">
        <span>Label:</span>
        <textarea
          className="text-textarea"
          value={textValue}
          onChange={(evt) => handleStringValueChange("text", evt.target.value)}
        />
      </div>
      <div className="row align-center gap-16">
        <span>Font:</span>
        <select
          id="font-select"
          value={fontValue}
          onChange={(evt) => handleFontValueChange(evt.target.value)}
        >
          <option value=""></option>
          {fonts.map(font => (
            <option
              key={font.postscriptName}
              value={font.postscriptName}
              style={{fontFamily: font.name}}
            >
              {font.name}
            </option>
          ))}
        </select>
      </div>
      <div className="row align-center gap-16">
        <span>Color:</span>
        <ColorSwatch
          color={fontColor}
          recents={recentColors}
          onUpdate={(color) => handleStringValueChange("fontColor", color)}
          onAddRecentColor={addRecentColor}
        />
      </div>
      <div className="row align-center gap-16">
        <span>Size:</span>
        <input
          type="number"
          min={5}
          value={fontSize}
          onChange={handleFontSizeChange}
        />
      </div>
      <div className="row align-center gap-16">
        <span style={{ width: 140 }}>Horizontal Alignment:</span>
        <MdAlignHorizontalLeft
          className="pointer"
          size={16}
          style={{ color: hAlignment === "left" ? "var(--gradient-stop1)" : undefined }}
          onClick={() => handleAlignmentChange("left")}
        />
        <MdAlignHorizontalCenter
          className="pointer"
          size={16}
          style={{ color: hAlignment === "center" ? "var(--gradient-stop1)" : undefined }}
          onClick={() => handleAlignmentChange("center")}
        />
        <MdAlignHorizontalRight
          className="pointer"
          size={16}
          style={{ color: hAlignment === "right" ? "var(--gradient-stop1)" : undefined }}
          onClick={() => handleAlignmentChange("right")}
        />
      </div>
      <div className="row align-center gap-16">
        <span style={{ width: 140 }}>Vertical Alignment:</span>
        <MdAlignVerticalTop
          className="pointer"
          size={16}
          style={{ color: vAlignment === "top" ? "var(--gradient-stop1)" : undefined }}
          onClick={() => handleAlignmentChange("top")}
        />
        <MdAlignVerticalCenter
          className="pointer"
          size={16}
          style={{ color: vAlignment === "middle" ? "var(--gradient-stop1)" : undefined }}
          onClick={() => handleAlignmentChange("middle")}
        />
        <MdAlignVerticalBottom
          className="pointer"
          size={16}
          style={{ color: vAlignment === "bottom" ? "var(--gradient-stop1)" : undefined }}
          onClick={() => handleAlignmentChange("bottom")}
        />
      </div>
    </div>
  );
}