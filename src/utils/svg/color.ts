import {SvgXmlNode} from "@common/shared/models";

export type SvgColorCoordinates = {
  type: "fill"|"stroke";
  color: string;
  path: string;
};

export function extractColors(node: SvgXmlNode, path: string[] = [], results: SvgColorCoordinates[] = []): SvgColorCoordinates[] {
  const currentPath = [...path, node.name];

  for (const [key, value] of Object.entries(node.attributes)) {
    if (key === "fill" || key === "stroke") {
      const color = normalizeColor(value);
      if (color)
        results.push({
          type: key as "fill" | "stroke",
          color,
          path: currentPath.join("."),
        });
    }
  }

  node.children.forEach((child, index) => {
    extractColors(child, [...currentPath.slice(0, -1), `${node.name}[${index}]`], results);
  });

  return results;
}

function normalizeColor(value: string): string | null {
  const v = value.trim();
  if (!v || v === "none" || v.startsWith("url(")) return null;
  return v;
}

export function replaceSvgColor(
  node: SvgXmlNode,
  targetPath: string,
  targetType: "fill"|"stroke",
  newColor: string
): SvgXmlNode {
  function recursive(n: SvgXmlNode, currentPath: string[]): SvgXmlNode {
    const thisPath = [...currentPath, n.name].join(".");

    const clone: SvgXmlNode = {
      ...n,
      attributes: { ...n.attributes },
      children: [],
    };

    if (thisPath === targetPath) {
      clone.attributes[targetType] = newColor;
    }

    clone.children = n.children.map((child, i) => {
      const lastSegment = currentPath[currentPath.length - 1];
      const path = lastSegment === n.name ? currentPath.slice(0, -1) : currentPath;
      return recursive(child, [...path, `${n.name}[${i}]`]);
    });

    return clone;
  }

  return recursive(node, [node.name]);
}
