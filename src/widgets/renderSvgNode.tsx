import {SvgXmlNode} from "@common/shared/models";
import {Circle, Ellipse, Group, Line, Path, Rect} from "react-konva";

export function renderSvgNode(node: SvgXmlNode, key?: string|number) {
  if (node.type === "text") return null;

  const { name, attributes, children } = node;
  const renderedChildren = children.map((child, i) => renderSvgNode(child, i));

  switch (name) {
    case "svg":
    case "g":
      return (
        <Group
          key={key}
        >
          {renderedChildren}
        </Group>
      );
    case "path":
      const pathAttr = {
        ...attributes,
        ...(attributes.style ? parseStyleAttribute(attributes.style) : {}),
      };
      return (
        <Path
          key={key}
          data={pathAttr.d || ""}
          fill={pathAttr.fill || undefined}
          fillRule={pathAttr.fillRule as CanvasFillRule || undefined}
          stroke={pathAttr.stroke || undefined}
          strokeWidth={parseFloat(pathAttr["stroke-width"] || "1")}
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

function parseStyleAttribute(style: string): Record<string, string> {
  return style.split(";").reduce((acc, rule) => {
    const [key, value] = rule.split(":").map((s) => s.trim());
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      acc[camelKey] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}
