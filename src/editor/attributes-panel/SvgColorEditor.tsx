import { SvgXmlNode } from "@common/shared/models";
import { useEffect, useRef, useState } from "react";

import { useRecentColors } from "../../hooks/useRecentColors.ts";
import { ColorSwatch } from "./ColorSwatch.tsx";

export type SvgColorEditorProps = {
  svg: SvgXmlNode;
  onUpdate: (svg: SvgXmlNode) => void;
};

type ColorEntry = { id: number; attr: "fill" | "stroke"; color: string };
type StrokeWidthEntry = { path: string; label: string; width: number };

export function SvgColorEditor({ svg, onUpdate }: SvgColorEditorProps) {
  const { recentColors, addRecentColor } = useRecentColors();
  const nextId = useRef(0);
  const [entries, setEntries] = useState<ColorEntry[]>(() =>
    extractColorEntries(svg).map((e) => ({ ...e, id: nextId.current++ })),
  );
  const [strokeWidths, setStrokeWidths] = useState<StrokeWidthEntry[]>(() =>
    extractStrokeWidths(svg),
  );

  const prevSvgRef = useRef(svg);
  useEffect(() => {
    if (prevSvgRef.current === svg) return;
    prevSvgRef.current = svg;
    const current = extractColorEntries(svg);
    setEntries((prev) => {
      if (
        prev.length === current.length &&
        prev.every((e, i) => e.attr === current[i].attr && e.color === current[i].color)
      ) {
        return prev;
      }
      return current.map((e) => ({ ...e, id: nextId.current++ }));
    });
    setStrokeWidths(extractStrokeWidths(svg));
  }, [svg]);

  const handleColorChange = (entry: ColorEntry, newColor: string) => {
    const updated = replaceColorByAttr(svg, entry.attr, entry.color, newColor);
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id ? { ...e, color: newColor } : e,
      ),
    );
    onUpdate(updated);
  };

  const handleStrokeWidthChange = (path: string, newWidth: number) => {
    const updated = setStrokeWidthAtPath(svg, path, newWidth);
    setStrokeWidths((prev) =>
      prev.map((e) => (e.path === path ? { ...e, width: newWidth } : e)),
    );
    onUpdate(updated);
  };

  return (
    <div className="col gap-16">
      {entries.length > 0 && (
        <div className="col gap-8">
          <span style={{ fontSize: 11, opacity: 0.6 }}>SVG Colors</span>
          {entries.map((entry) => (
            <div key={entry.id} className="row align-items-center gap-16">
              <ColorSwatch
                color={entry.color}
                recents={recentColors}
                onUpdate={(c) => handleColorChange(entry, c)}
                onAddRecentColor={addRecentColor}
              />
              <span style={{ fontSize: 11, opacity: 0.6 }}>{entry.attr}</span>
            </div>
          ))}
        </div>
      )}
      {strokeWidths.length > 0 && (
        <div className="col gap-8">
          <span style={{ fontSize: 11, opacity: 0.6 }}>Stroke Widths</span>
          {strokeWidths.map((entry) => (
            <div key={entry.path} className="row align-items-center gap-16">
              <span style={{ fontSize: 11, opacity: 0.6, minWidth: 60 }}>
                {entry.label}
              </span>
              <input
                type="number"
                min={0}
                step={0.5}
                style={{ width: 65 }}
                value={entry.width}
                onChange={(e) =>
                  handleStrokeWidthChange(
                    entry.path,
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SKIP_COLORS = new Set([
  "none",
  "transparent",
  "inherit",
  "currentColor",
  "",
]);

type RawEntry = { attr: "fill" | "stroke"; color: string };

function extractColorEntries(node: SvgXmlNode): RawEntry[] {
  const seen = new Set<string>();
  const results: RawEntry[] = [];
  collectUniqueAttrColors(node, seen, results);
  return results;
}

function collectUniqueAttrColors(
  node: SvgXmlNode,
  seen: Set<string>,
  results: RawEntry[],
) {
  if (node.type === "text") return;
  const { fill, stroke } = node.attributes;

  if (fill && !SKIP_COLORS.has(fill)) {
    const key = `fill:${fill}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ attr: "fill", color: fill });
    }
  }
  if (stroke && !SKIP_COLORS.has(stroke)) {
    const key = `stroke:${stroke}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ attr: "stroke", color: stroke });
    }
  }

  for (const child of node.children) {
    collectUniqueAttrColors(child, seen, results);
  }
}

function replaceColorByAttr(
  node: SvgXmlNode,
  attr: "fill" | "stroke",
  oldColor: string,
  newColor: string,
): SvgXmlNode {
  const attributes = { ...node.attributes };
  if (attributes[attr] === oldColor) {
    attributes[attr] = newColor;
  }
  return {
    ...node,
    attributes,
    children: node.children.map((child) =>
      replaceColorByAttr(child, attr, oldColor, newColor),
    ),
  };
}

function extractStrokeWidths(node: SvgXmlNode): StrokeWidthEntry[] {
  const results: StrokeWidthEntry[] = [];
  collectStrokeWidths(node, [], results, 0);
  return results;
}

function collectStrokeWidths(
  node: SvgXmlNode,
  path: number[],
  results: StrokeWidthEntry[],
  index: number,
) {
  if (node.type === "text") return;

  const stroke = node.attributes.stroke;
  if (stroke && !SKIP_COLORS.has(stroke)) {
    const rawWidth =
      node.attributes["stroke-width"] ?? node.attributes.strokeWidth;
    const width = rawWidth ? parseFloat(rawWidth) : 1;
    const pathStr = [...path, index].join(".");
    const label = node.name === "svg" ? "root" : node.name;
    results.push({ path: pathStr, label, width });
  }

  node.children.forEach((child, i) => {
    collectStrokeWidths(child, [...path, index], results, i);
  });
}

function setStrokeWidthAtPath(
  node: SvgXmlNode,
  targetPath: string,
  newWidth: number,
  path: number[] = [],
  index: number = 0,
): SvgXmlNode {
  const thisPath = [...path, index].join(".");
  const attributes = { ...node.attributes };

  if (thisPath === targetPath) {
    attributes["stroke-width"] = String(newWidth);
    delete attributes.strokeWidth;
  }

  return {
    ...node,
    attributes,
    children: node.children.map((child, i) =>
      setStrokeWidthAtPath(child, targetPath, newWidth, [...path, index], i),
    ),
  };
}
