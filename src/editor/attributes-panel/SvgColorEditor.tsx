import { SvgXmlNode } from "@common/shared/models";
import { useEffect, useRef, useState } from "react";

import { useRecentColors } from "../../hooks/useRecentColors.ts";
import { ColorSwatch } from "./ColorSwatch.tsx";

export type SvgColorEditorProps = {
  svg: SvgXmlNode;
  onUpdate: (svg: SvgXmlNode) => void;
};

type ColorEntry = { id: number; color: string };

export function SvgColorEditor({ svg, onUpdate }: SvgColorEditorProps) {
  const { recentColors, addRecentColor } = useRecentColors();
  const nextId = useRef(0);
  const [entries, setEntries] = useState<ColorEntry[]>(() =>
    extractUniqueColors(svg).map((c) => ({ id: nextId.current++, color: c })),
  );

  // Re-sync entries when the SVG changes externally (e.g. new import)
  const prevSvgRef = useRef(svg);
  useEffect(() => {
    if (prevSvgRef.current === svg) return;
    prevSvgRef.current = svg;
    const current = extractUniqueColors(svg);
    setEntries((prev) => {
      if (prev.length === current.length && prev.every((e, i) => e.color === current[i])) {
        return prev;
      }
      return current.map((c) => ({ id: nextId.current++, color: c }));
    });
  }, [svg]);

  const handleColorChange = (entry: ColorEntry, newColor: string) => {
    const updated = replaceColor(svg, entry.color, newColor);
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, color: newColor } : e)),
    );
    onUpdate(updated);
  };

  if (entries.length === 0) return null;

  return (
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
          <span style={{ fontSize: 11, opacity: 0.6 }}>{entry.color}</span>
        </div>
      ))}
    </div>
  );
}

const SKIP_COLORS = new Set(["none", "transparent", "inherit", "currentColor", ""]);

function extractUniqueColors(node: SvgXmlNode): string[] {
  const colors = new Set<string>();
  collectColors(node, colors);
  return Array.from(colors);
}

function collectColors(node: SvgXmlNode, colors: Set<string>) {
  if (node.type === "text") return;
  const { fill, stroke } = node.attributes;
  if (fill && !SKIP_COLORS.has(fill)) colors.add(fill);
  if (stroke && !SKIP_COLORS.has(stroke)) colors.add(stroke);
  for (const child of node.children) {
    collectColors(child, colors);
  }
}

function replaceColor(node: SvgXmlNode, oldColor: string, newColor: string): SvgXmlNode {
  const attributes = { ...node.attributes };
  if (attributes.fill === oldColor) attributes.fill = newColor;
  if (attributes.stroke === oldColor) attributes.stroke = newColor;
  return {
    ...node,
    attributes,
    children: node.children.map((child) => replaceColor(child, oldColor, newColor)),
  };
}
