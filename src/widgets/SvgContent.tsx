import {SvgUtils} from "../utils/svg/parseSvg.ts";
import {SvgXmlNode} from "@common/shared/models";
import {Fragment} from "react";
import {Circle, Ellipse, Group, Line, Path, Rect} from "react-konva";

export function SvgContent({ svg, targetWidth, targetHeight }: { svg: SvgXmlNode, targetWidth: number, targetHeight: number }) {
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

function renderSvgNode(node: SvgXmlNode, key?: string|number) {
  if (node.type === "text") return null;

  const { name, attributes, children } = node;
  const renderedChildren = children.map((child, i) => renderSvgNode(child, i));

  switch (name) {
    case "svg":
      return (<Fragment>{renderedChildren}</Fragment>);
    case "g":
      return (
        <Group key={key}>
          {renderedChildren}
        </Group>
      );
    case "path":
      return (
        <Path
          key={key}
          data={attributes.d || ""}
          fill={attributes.fill || undefined}
          fillRule={attributes.fillRule as CanvasFillRule || undefined}
          stroke={attributes.stroke || undefined}
          strokeWidth={parseFloat(attributes["stroke-width"] || "1")}
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
          fill={attributes.fill || undefined}
          stroke={attributes.stroke || undefined}
          strokeWidth={parseFloat(attributes["stroke-width"] || "1")}
        />
      );

    case "circle":
      return (
        <Circle
          key={key}
          x={parseFloat(attributes.cx || "0")}
          y={parseFloat(attributes.cy || "0")}
          radius={parseFloat(attributes.r || "0")}
          fill={attributes.fill || undefined}
          stroke={attributes.stroke || undefined}
          strokeWidth={parseFloat(attributes["stroke-width"] || "1")}
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
          fill={attributes.fill || undefined}
          stroke={attributes.stroke || undefined}
          strokeWidth={parseFloat(attributes["stroke-width"] || "1")}
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
          stroke={attributes.stroke || undefined}
          strokeWidth={parseFloat(attributes["stroke-width"] || "1")}
        />
      );

    default:
      return null;
  }
}
