import { SvgXmlNode } from "@common/shared/models";
import SvgPath from "svgpath";

import {
  applyMatrix,
  IDENTITY,
  Matrix,
  multiply,
  parseTransform,
} from "./matrix.ts";

export function normalize(
  node: SvgXmlNode,
  parentMatrix: Matrix = IDENTITY,
): SvgXmlNode {
  // Compute cumulative matrix
  const localMatrix = multiply(
    parentMatrix,
    parseTransform(node.attributes.transform),
  );

  // Copy attributes and remove transform + style
  const parsedStyle = node.attributes.style
    ? parseStyleAttribute(node.attributes.style)
    : {};
  const attr = {
    ...node.attributes,
    ...parsedStyle,
    // fixup fill/stroke/stroke-width; prefer attributes to style when both are present
    fill: node.attributes.fill ?? parsedStyle.fill,
    stroke: node.attributes.stroke ?? parsedStyle.stroke,
    strokeWidth: node.attributes.strokeWidth ?? parsedStyle.strokeWidth,
  } as Record<string, string>;
  delete attr.transform;
  delete attr.style;

  // Apply transform to this node
  if (node.name === "path" && attr.d) {
    attr.d = new SvgPath(attr.d).matrix(localMatrix).toString();
  } else if (node.name === "rect") {
    const x = parseFloat(attr.x || "0");
    const y = parseFloat(attr.y || "0");
    const [nx, ny] = applyMatrix([x, y], localMatrix);
    attr.x = nx.toString();
    attr.y = ny.toString();
  } else if (node.name === "circle") {
    const cx = parseFloat(attr.cx || "0");
    const cy = parseFloat(attr.cy || "0");
    const [nx, ny] = applyMatrix([cx, cy], localMatrix);
    attr.cx = nx.toString();
    attr.cy = ny.toString();
  } else if (node.name === "ellipse") {
    const cx = parseFloat(attr.cx || "0");
    const cy = parseFloat(attr.cy || "0");
    const [nx, ny] = applyMatrix([cx, cy], localMatrix);
    attr.cx = nx.toString();
    attr.cy = ny.toString();
  } else if (node.name === "line") {
    const x1 = parseFloat(attr.x1 || "0");
    const y1 = parseFloat(attr.y1 || "0");
    const x2 = parseFloat(attr.x2 || "0");
    const y2 = parseFloat(attr.y2 || "0");
    const [nx1, ny1] = applyMatrix([x1, y1], localMatrix);
    const [nx2, ny2] = applyMatrix([x2, y2], localMatrix);
    attr.x1 = nx1.toString();
    attr.y1 = ny1.toString();
    attr.x2 = nx2.toString();
    attr.y2 = ny2.toString();
  }

  const newChildren = node.children.map((child) =>
    normalize(child, localMatrix),
  );

  return {
    ...node,
    attributes: attr,
    children: newChildren,
  };
}

function parseStyleAttribute(style: string): Record<string, string> {
  return style.split(";").reduce(
    (acc, rule) => {
      const [key, value] = rule.split(":").map((s) => s.trim());
      if (key && value) {
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        acc[camelKey] = value;
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}
