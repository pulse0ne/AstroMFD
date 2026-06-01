import { SvgXmlNode } from "@common/shared/models";
import { Fragment } from "react";
import { Circle, Ellipse, Group, Line, Path, Rect } from "react-konva";

import { SvgUtils } from "../utils/svg/parseSvg.ts";
import { LineCap, LineJoin } from "konva/lib/Shape";

export function SvgContent({
  svg,
  targetWidth,
  targetHeight,
}: {
  svg: SvgXmlNode;
  targetWidth: number;
  targetHeight: number;
}) {
  const vb = SvgUtils.getSvgViewBox(svg);
  const scaleX = targetWidth / vb.width;
  const scaleY = targetHeight / vb.height;

  const content = renderSvgNode(svg);

  return (
    <Group
      scaleX={scaleX}
      scaleY={scaleY}
      x={-vb.x * scaleX}
      y={-vb.y * scaleY}
    >
      {content}
    </Group>
  );
}

function svgColor(value: string | undefined): string | undefined {
  if (!value || value === "none" || value === "transparent") return undefined;
  return value;
}

function getStrokeWidth(attributes: Record<string, string>): number {
  const raw = attributes.strokeWidth ?? attributes["stroke-width"];
  return raw ? parseFloat(raw) : 0;
}

function getLinecap(attributes: Record<string, string>): LineCap | undefined {
  return (attributes.strokeLinecap ?? attributes["stroke-linecap"]) as LineCap | undefined;
}

function getLinejoin(attributes: Record<string, string>): LineJoin | undefined {
  return (attributes.strokeLinejoin ?? attributes["stroke-linejoin"]) as LineJoin | undefined;
}

function parsePoints(pointsStr: string): number[] {
  return pointsStr
    .trim()
    .split(/[\s,]+/)
    .map(Number);
}

function renderSvgNode(node: SvgXmlNode, key?: string | number) {
  if (node.type === "text") return null;

  const { name, attributes, children } = node;
  const renderedChildren = children.map((child, i) => renderSvgNode(child, i));

  switch (name) {
    case "svg":
      return <Fragment>{renderedChildren}</Fragment>;
    case "g":
      return <Group key={key}>{renderedChildren}</Group>;
    case "path":
      return (
        <Path
          key={key}
          data={attributes.d || ""}
          fill={svgColor(attributes.fill)}
          fillRule={(attributes.fillRule as CanvasFillRule) || undefined}
          stroke={svgColor(attributes.stroke)}
          strokeWidth={getStrokeWidth(attributes)}
          lineCap={getLinecap(attributes)}
          lineJoin={getLinejoin(attributes)}
        />
      );

    case "rect":
      return (
        <Rect
          key={key}
          x={parseFloat(attributes.x || "0")}
          y={parseFloat(attributes.y || "0")}
          width={parseFloat(attributes.width || "0")}
          height={parseFloat(attributes.height || "0")}
          fill={svgColor(attributes.fill)}
          stroke={svgColor(attributes.stroke)}
          strokeWidth={getStrokeWidth(attributes)}
        />
      );

    case "circle":
      return (
        <Circle
          key={key}
          x={parseFloat(attributes.cx || "0")}
          y={parseFloat(attributes.cy || "0")}
          radius={parseFloat(attributes.r || "0")}
          fill={svgColor(attributes.fill)}
          stroke={svgColor(attributes.stroke)}
          strokeWidth={getStrokeWidth(attributes)}
        />
      );

    case "ellipse":
      return (
        <Ellipse
          key={key}
          x={parseFloat(attributes.cx || "0")}
          y={parseFloat(attributes.cy || "0")}
          radiusX={parseFloat(attributes.rx || "0")}
          radiusY={parseFloat(attributes.ry || "0")}
          fill={svgColor(attributes.fill)}
          stroke={svgColor(attributes.stroke)}
          strokeWidth={getStrokeWidth(attributes)}
        />
      );

    case "line":
      return (
        <Line
          key={key}
          points={[
            parseFloat(attributes.x1 || "0"),
            parseFloat(attributes.y1 || "0"),
            parseFloat(attributes.x2 || "0"),
            parseFloat(attributes.y2 || "0"),
          ]}
          stroke={svgColor(attributes.stroke)}
          strokeWidth={getStrokeWidth(attributes)}
          lineCap={getLinecap(attributes)}
          lineJoin={getLinejoin(attributes)}
        />
      );

    case "polygon":
      return (
        <Line
          key={key}
          points={parsePoints(attributes.points || "")}
          closed={true}
          fill={svgColor(attributes.fill)}
          stroke={svgColor(attributes.stroke)}
          strokeWidth={getStrokeWidth(attributes)}
        />
      );

    case "polyline":
      return (
        <Line
          key={key}
          points={parsePoints(attributes.points || "")}
          closed={false}
          fill={svgColor(attributes.fill)}
          stroke={svgColor(attributes.stroke)}
          strokeWidth={getStrokeWidth(attributes)}
          lineCap={getLinecap(attributes)}
          lineJoin={getLinejoin(attributes)}
        />
      );

    default:
      return null;
  }
}
