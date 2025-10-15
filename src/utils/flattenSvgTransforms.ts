// import { parseSVG, makeAbsolute, Command } from "svg-path-parser";
//
// /** 2D affine matrix [a, b, c, d, e, f] matching SVG's matrix() order */
// type Matrix = [number, number, number, number, number, number];
//
// const identity: Matrix = [1, 0, 0, 1, 0, 0];
//
// function multiply(a: Matrix, b: Matrix): Matrix {
//   return [
//     a[0] * b[0] + a[2] * b[1],
//     a[1] * b[0] + a[3] * b[1],
//     a[0] * b[2] + a[2] * b[3],
//     a[1] * b[2] + a[3] * b[3],
//     a[0] * b[4] + a[2] * b[5] + a[4],
//     a[1] * b[4] + a[3] * b[5] + a[5],
//   ];
// }
//
// function parseTransform(attr?: string): Matrix {
//   if (!attr) return identity;
//   let m = identity.slice() as Matrix;
//
//   const commands = attr.match(/[a-z]+\([^)]*\)/gi);
//   if (!commands) return m;
//
//   for (const cmd of commands) {
//     const [type, argsRaw] = cmd.split("(");
//     const args = argsRaw
//       .replace(")", "")
//       .split(/[ ,]+/)
//       .filter(Boolean)
//       .map(Number);
//
//     switch (type.trim()) {
//       case "matrix": {
//         if (args.length === 6) {
//           m = multiply(m, args as Matrix);
//         }
//         break;
//       }
//       case "translate": {
//         const [tx, ty = 0] = args;
//         m = multiply(m, [1, 0, 0, 1, tx, ty]);
//         break;
//       }
//       case "scale": {
//         const [sx, sy = sx] = args;
//         m = multiply(m, [sx, 0, 0, sy, 0, 0]);
//         break;
//       }
//       case "rotate": {
//         const [angle, cx = 0, cy = 0] = args;
//         const rad = (angle * Math.PI) / 180;
//         const cos = Math.cos(rad);
//         const sin = Math.sin(rad);
//         if (cx || cy) {
//           // rotate around a point
//           m = multiply(m, [1, 0, 0, 1, cx, cy]);
//           m = multiply(m, [cos, sin, -sin, cos, 0, 0]);
//           m = multiply(m, [1, 0, 0, 1, -cx, -cy]);
//         } else {
//           m = multiply(m, [cos, sin, -sin, cos, 0, 0]);
//         }
//         break;
//       }
//       case "skewX": {
//         const angle = (args[0] * Math.PI) / 180;
//         m = multiply(m, [1, 0, Math.tan(angle), 1, 0, 0]);
//         break;
//       }
//       case "skewY": {
//         const angle = (args[0] * Math.PI) / 180;
//         m = multiply(m, [1, Math.tan(angle), 0, 1, 0, 0]);
//         break;
//       }
//     }
//   }
//   return m;
// }
//
// function applyMatrixToPoint([x, y]: [number, number], m: Matrix): [number, number] {
//   return [x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]];
// }
//
// /** Takes an <svg> element string and returns new SVG string with flattened coordinates */
// export function flattenSvgTransforms(svgString: string): string {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(svgString, "image/svg+xml");
//
//   const paths = Array.from(doc.querySelectorAll("path"));
//   for (const path of paths) {
//     let combined = identity.slice() as Matrix;
//
//     // walk up all parents accumulating transforms
//     let el: Element | null = path;
//     while (el) {
//       const t = el.getAttribute("transform");
//       if (t) combined = multiply(parseTransform(t), combined);
//       el = el.parentElement;
//     }
//
//     const d = path.getAttribute("d");
//     if (!d) continue;
//
//     const cmds = makeAbsolute(parseSVG(d));
//     for (const cmd of cmds) {
//       if ("x" in cmd && "y" in cmd) {
//         [cmd.x, cmd.y] = applyMatrixToPoint([cmd.x, cmd.y], combined);
//       }
//       if ("x1" in cmd && "y1" in cmd) {
//         [cmd.x1, cmd.y1] = applyMatrixToPoint([cmd.x1, cmd.y1], combined);
//       }
//       if ("x2" in cmd && "y2" in cmd) {
//         [cmd.x2, cmd.y2] = applyMatrixToPoint([cmd.x2, cmd.y2], combined);
//       }
//     }
//
//     path.setAttribute("d", serializePath(cmds));
//     path.removeAttribute("transform");
//   }
//
//   return new XMLSerializer().serializeToString(doc);
// }
//
// export function serializePath(commands: Command[]): string {
//   const parts: string[] = [];
//
//   for (const c of commands) {
//     switch (c.command) {
//       case "moveto":
//         parts.push(`M ${c.x} ${c.y}`);
//         break;
//       case "lineto":
//         parts.push(`L ${c.x} ${c.y}`);
//         break;
//       case "horizontal lineto":
//         parts.push(`H ${c.x}`);
//         break;
//       case "vertical lineto":
//         parts.push(`V ${c.y}`);
//         break;
//       case "curveto":
//         parts.push(`C ${c.x1} ${c.y1} ${c.x2} ${c.y2} ${c.x} ${c.y}`);
//         break;
//       case "quadratic curveto":
//         parts.push(`Q ${c.x1} ${c.y1} ${c.x} ${c.y}`);
//         break;
//       case "smooth curveto":
//         parts.push(`S ${c.x2} ${c.y2} ${c.x} ${c.y}`);
//         break;
//       case "smooth quadratic curveto":
//         parts.push(`T ${c.x} ${c.y}`);
//         break;
//       case "elliptical arc":
//         parts.push(
//           `A ${c.rx} ${c.ry} ${c.xAxisRotation} ${c.largeArc ? 1 : 0} ${c.sweep ? 1 : 0} ${c.x} ${c.y}`
//         );
//         break;
//       case "closepath":
//         parts.push("Z");
//         break;
//     }
//   }
//
//   return parts.join(" ");
// }

import SvgPath from "svgpath";
import {applyMatrix, IDENTITY, Matrix, multiply, parseTransform} from "./matrix.ts";
import {SvgXmlNode} from "@common/shared/models";

export function flattenXmlNodeTransforms(node: SvgXmlNode, parentMatrix: Matrix = IDENTITY): SvgXmlNode {
  // Compute cumulative matrix
  const localMatrix = multiply(parentMatrix, parseTransform(node.attributes.transform));

  // Copy attributes and remove transform
  const newAttrs = { ...node.attributes };
  delete newAttrs.transform;

  // Apply transform to this node
  if (node.name === "path" && newAttrs.d) {
    newAttrs.d = new SvgPath(newAttrs.d)
      .matrix(localMatrix)
      .toString();
  } else if (node.name === "rect") {
    const x = parseFloat(newAttrs.x || "0");
    const y = parseFloat(newAttrs.y || "0");
    const [nx,ny] = applyMatrix([x,y], localMatrix);
    newAttrs.x = nx.toString();
    newAttrs.y = ny.toString();
  } else if (node.name === "circle") {
    const cx = parseFloat(newAttrs.cx || "0");
    const cy = parseFloat(newAttrs.cy || "0");
    const [nx,ny] = applyMatrix([cx,cy], localMatrix);
    newAttrs.cx = nx.toString();
    newAttrs.cy = ny.toString();
  } else if (node.name === "ellipse") {
    const cx = parseFloat(newAttrs.cx || "0");
    const cy = parseFloat(newAttrs.cy || "0");
    const [nx,ny] = applyMatrix([cx,cy], localMatrix);
    newAttrs.cx = nx.toString();
    newAttrs.cy = ny.toString();
  } else if (node.name === "line") {
    const x1 = parseFloat(newAttrs.x1 || "0");
    const y1 = parseFloat(newAttrs.y1 || "0");
    const x2 = parseFloat(newAttrs.x2 || "0");
    const y2 = parseFloat(newAttrs.y2 || "0");
    const [nx1,ny1] = applyMatrix([x1,y1], localMatrix);
    const [nx2,ny2] = applyMatrix([x2,y2], localMatrix);
    newAttrs.x1 = nx1.toString();
    newAttrs.y1 = ny1.toString();
    newAttrs.x2 = nx2.toString();
    newAttrs.y2 = ny2.toString();
  }

  const newChildren = node.children.map(child => flattenXmlNodeTransforms(child, localMatrix));

  return {
    ...node,
    attributes: newAttrs,
    children: newChildren
  };
}

