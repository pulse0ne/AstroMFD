import type { SvgXmlNode } from "@common/shared/models";
import type { CSSProperties } from "react";

export type SvgRendererProps = {
  svg: SvgXmlNode;
  width: number;
  height: number;
  style?: CSSProperties;
};

export function SvgRenderer({ svg, width, height, style }: SvgRendererProps) {
  const vb = getViewBox(svg);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        ...style,
      }}
    >
      {renderChildren(svg)}
    </svg>
  );
}

function getViewBox(node: SvgXmlNode): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (node.attributes.viewBox) {
    const parts = node.attributes.viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
    }
  }
  const w = parseFloat(node.attributes.width || "100");
  const h = parseFloat(node.attributes.height || "100");
  return { x: 0, y: 0, width: w, height: h };
}

function renderChildren(node: SvgXmlNode): React.ReactNode {
  return node.children.map((child, i) => renderNode(child, i));
}

function renderNode(node: SvgXmlNode, key: number): React.ReactNode {
  if (node.type === "text") return null;

  const { name, attributes, children } = node;

  switch (name) {
    case "svg":
      return renderChildren(node);
    case "g":
      return <g key={key}>{children.map((c, i) => renderNode(c, i))}</g>;
    case "path":
      return (
        <path
          key={key}
          d={attributes.d || ""}
          fill={attributes.fill || undefined}
          fillRule={
            attributes["fill-rule"] as "nonzero" | "evenodd" | undefined
          }
          stroke={attributes.stroke || undefined}
          strokeWidth={attributes["stroke-width"] || undefined}
          opacity={attributes.opacity || undefined}
        />
      );
    case "rect":
      return (
        <rect
          key={key}
          x={attributes.x || "0"}
          y={attributes.y || "0"}
          width={attributes.width || "0"}
          height={attributes.height || "0"}
          rx={attributes.rx || undefined}
          ry={attributes.ry || undefined}
          fill={attributes.fill || undefined}
          stroke={attributes.stroke || undefined}
          strokeWidth={attributes["stroke-width"] || undefined}
          opacity={attributes.opacity || undefined}
        />
      );
    case "circle":
      return (
        <circle
          key={key}
          cx={attributes.cx || "0"}
          cy={attributes.cy || "0"}
          r={attributes.r || "0"}
          fill={attributes.fill || undefined}
          stroke={attributes.stroke || undefined}
          strokeWidth={attributes["stroke-width"] || undefined}
          opacity={attributes.opacity || undefined}
        />
      );
    case "ellipse":
      return (
        <ellipse
          key={key}
          cx={attributes.cx || "0"}
          cy={attributes.cy || "0"}
          rx={attributes.rx || "0"}
          ry={attributes.ry || "0"}
          fill={attributes.fill || undefined}
          stroke={attributes.stroke || undefined}
          strokeWidth={attributes["stroke-width"] || undefined}
          opacity={attributes.opacity || undefined}
        />
      );
    case "line":
      return (
        <line
          key={key}
          x1={attributes.x1 || "0"}
          y1={attributes.y1 || "0"}
          x2={attributes.x2 || "0"}
          y2={attributes.y2 || "0"}
          stroke={attributes.stroke || undefined}
          strokeWidth={attributes["stroke-width"] || undefined}
          opacity={attributes.opacity || undefined}
        />
      );
    case "polygon":
      return (
        <polygon
          key={key}
          points={attributes.points || ""}
          fill={attributes.fill || undefined}
          stroke={attributes.stroke || undefined}
          strokeWidth={attributes["stroke-width"] || undefined}
          opacity={attributes.opacity || undefined}
        />
      );
    case "polyline":
      return (
        <polyline
          key={key}
          points={attributes.points || ""}
          fill={attributes.fill || "none"}
          stroke={attributes.stroke || undefined}
          strokeWidth={attributes["stroke-width"] || undefined}
          opacity={attributes.opacity || undefined}
        />
      );
    default:
      return null;
  }
}
