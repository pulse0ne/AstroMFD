import {CSSProperties} from "react";
import Popup from "reactjs-popup";
import {RgbaStringColorPicker} from "react-colorful";

export type ColorSwatchProps = {
  color?: string;
  width?: number | string;
  height?: number | string;
  checkerSize?: number;
  onUpdate: (color: string) => void;
  onAddRecentColor: (color: string) => void;
};

export function ColorSwatch({color = "rgba(0, 0, 0, 0)", width = 96, height = 24, checkerSize = 16, onUpdate, onAddRecentColor }: ColorSwatchProps) {
  const svg = [
    `<svg xmlns='http://www.w3.org/2000/svg' width='${checkerSize}' height='${checkerSize}' viewBox='0 0 ${checkerSize} ${checkerSize}'>`,
    `<rect width='${checkerSize/2}' height='${checkerSize/2}' fill='%23fff'/>`,
    `<rect x='${checkerSize/2}' width='${checkerSize/2}' height='${checkerSize/2}' fill='%23dcdcdc'/>`,
    `<rect x='${checkerSize/2}' y='${checkerSize/2}' width='${checkerSize/2}' height='${checkerSize/2}' fill='%23fff'/>`,
    `<rect y='${checkerSize/2}' width='${checkerSize/2}' height='${checkerSize/2}' fill='%23dcdcdc'/>`,
    `</svg>`
  ].join("");
  const bg = `url("data:image/svg+xml;utf8,${svg}")`;

  const style: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    backgroundImage: bg,
    backgroundRepeat: "repeat",
    backgroundSize: `${checkerSize}px ${checkerSize}px`,
    position: "relative",
    overflow: "hidden",
  };

  const overlayStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: color,
  };

  return (
    <Popup
      trigger={
        <div style={style}>
          <div style={overlayStyle} />
        </div>
      }
      position="left top"
      contentStyle={{ background: "var(--panel-color-hex)" }}
      onClose={() => onAddRecentColor(color)}
    >
      <RgbaStringColorPicker
        className="color-picker"
        color={color}
        onChange={onUpdate}
      />
    </Popup>
  );
}