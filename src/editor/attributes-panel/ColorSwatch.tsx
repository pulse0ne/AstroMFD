import {
  ChangeEvent,
  CSSProperties,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RgbaStringColorPicker } from "react-colorful";
import Popup from "reactjs-popup";

import "./color-swatch.css";

export type ColorSwatchProps = {
  color?: string;
  recents: string[];
  width?: number | string;
  height?: number | string;
  checkerSize?: number;
  onUpdate: (color: string) => void;
  onAddRecentColor: (color: string) => void;
};

export function ColorSwatch({
  color = "rgba(0, 0, 0, 0)",
  recents,
  onUpdate,
  onAddRecentColor,
}: ColorSwatchProps) {
  const rgba = useMemo(() => splitColor(color), [color]);
  const [wasCopied, setWasCopied] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    if (wasCopied) {
      timeout = setTimeout(() => {
        setWasCopied(false);
      }, 3000);
    } else {
      clearTimeout(timeout);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [wasCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(color).then(() => setWasCopied(true));
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    component: keyof RGBA,
  ) => {
    const data = event.clipboardData;
    if (data) {
      const text = data.getData("text");
      if (text) {
        const match = text.match(RE);
        if (match) {
          event.preventDefault();
          onUpdate(text);
        } else if (component === "a") {
          const parsed = Number.parseFloat(text);
          if (!isNaN(parsed)) {
            const newColor: RGBA = { ...rgba, [component]: clamp(parsed) };
            onUpdate(rgbaString(newColor));
          }
        } else {
          const parsed = Number.parseInt(text);
          if (!isNaN(parsed)) {
            const newColor: RGBA = { ...rgba, [component]: clamp(parsed) };
            onUpdate(rgbaString(newColor));
          }
        }
      }
    }
  };

  const handleInput = (
    event: ChangeEvent<HTMLInputElement>,
    component: keyof RGBA,
  ) => {
    const parser = component === "a" ? Number.parseFloat : Number.parseInt;
    const value = parser(event.target.value);
    if (!isNaN(value)) {
      onUpdate(rgbaString({ ...rgba, [component]: clamp(value) }));
    } else {
      onUpdate(rgbaString({ ...rgba, [component]: 0 }));
    }
  };

  return (
    <Popup
      trigger={
        <div>
          <Swatch color={color} width={96} height={24} checkerSize={16} />
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
      <table style={{ padding: 12, paddingTop: 0 }}>
        <tbody>
          <tr>
            <td>
              <span>r:</span>
            </td>
            <td>
              <input
                type="number"
                min={0}
                max={255}
                style={{ width: 48 }}
                value={rgba.r}
                onChange={(evt) => handleInput(evt, "r")}
                onPaste={(evt) => handlePaste(evt, "r")}
              />
            </td>
            <td>
              <span>g:</span>
            </td>
            <td>
              <input
                type="number"
                min={0}
                max={255}
                style={{ width: 48 }}
                value={rgba.g}
                onChange={(evt) => handleInput(evt, "g")}
                onPaste={(evt) => handlePaste(evt, "g")}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>b:</span>
            </td>
            <td>
              <input
                type="number"
                min={0}
                max={255}
                style={{ width: 48 }}
                value={rgba.b}
                onChange={(evt) => handleInput(evt, "b")}
                onPaste={(evt) => handlePaste(evt, "b")}
              />
            </td>
            <td>
              <span>a:</span>
            </td>
            <td>
              <input
                type="number"
                min={0}
                max={255}
                style={{ width: 48 }}
                value={rgba.a}
                onChange={(evt) => handleInput(evt, "a")}
                onPaste={(evt) => handlePaste(evt, "a")}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="col" style={{ paddingLeft: 12, paddingRight: 12 }}>
        <button onClick={handleCopy} disabled={wasCopied}>
          {wasCopied ? "COPIED" : "COPY"}
        </button>
      </div>
      <div
        className="row gap-8"
        style={{ padding: 12, flexWrap: "wrap", width: 176 }}
      >
        {recents.map((c, i) => (
          <div key={i} onClick={() => onUpdate(c)} style={{ cursor: "pointer" }}>
            <Swatch color={c} width={24} height={24} />
          </div>
        ))}
      </div>
    </Popup>
  );
}

type SwatchProps = {
  color?: string;
  width?: number | string;
  height?: number | string;
  checkerSize?: number;
};

const Swatch = forwardRef<HTMLDivElement, SwatchProps>(function Swatch(
  {
    color = "rgba(0, 0, 0, 0)",
    width = 96,
    height = 24,
    checkerSize = 16,
  }: SwatchProps,
  ref,
) {
  const svg = [
    `<svg xmlns='http://www.w3.org/2000/svg' width='${checkerSize}' height='${checkerSize}' viewBox='0 0 ${checkerSize} ${checkerSize}'>`,
    `<rect width='${checkerSize / 2}' height='${checkerSize / 2}' fill='%23fff'/>`,
    `<rect x='${checkerSize / 2}' width='${checkerSize / 2}' height='${checkerSize / 2}' fill='%23dcdcdc'/>`,
    `<rect x='${checkerSize / 2}' y='${checkerSize / 2}' width='${checkerSize / 2}' height='${checkerSize / 2}' fill='%23fff'/>`,
    `<rect y='${checkerSize / 2}' width='${checkerSize / 2}' height='${checkerSize / 2}' fill='%23dcdcdc'/>`,
    `</svg>`,
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
    border: "var(--border-light)",
  };

  const overlayStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: color,
    cursor: "pointer",
  };

  return (
    <div ref={ref} style={style}>
      <div style={overlayStyle}></div>
    </div>
  );
});

type RGBA = { r: number; g: number; b: number; a: number };
const RE = /rgba\((?<r>\d+?), ?(?<g>\d+?), ?(?<b>\d+?), ?(?<a>.+?)\)/;

function splitColor(colorString: string): RGBA {
  const match = colorString.match(RE);
  if (match && match.groups) {
    const { r, g, b, a } = match.groups;
    return {
      r: Number.parseInt(r),
      g: Number.parseInt(g),
      b: Number.parseInt(b),
      a: Number.parseFloat(a),
    };
  }
  return { r: 0, g: 0, b: 0, a: 0 };
}

function rgbaString(rgba: RGBA): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}
