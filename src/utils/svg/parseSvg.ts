import { Position, Size, SvgXmlNode } from "@common/shared/models";
import { parseSync } from "xml-reader";

import { normalize } from "./normalize.ts";

export namespace SvgUtils {
  export function parse(rawText: string): SvgXmlNode {
    const parsed = parseSync(`<root>${rawText}</root>`, { parentNodes: false });
    const isValid =
      parsed.children &&
      parsed.children.length === 1 &&
      parsed.children.every((n) => n.name === "svg");
    if (isValid) {
      return normalize(parsed.children[0]);
    }
    throw Error("failed to parse svg");
  }

  export function getSvgViewBox(svg: SvgXmlNode): Size & Position {
    const vb = svg.attributes.viewBox?.split(/\s+/).map(Number);
    if (vb && vb.length === 4) {
      return { x: vb[0], y: vb[1], width: vb[2], height: vb[3] };
    }
    const w = parseFloat(svg.attributes.width || "100");
    const h = parseFloat(svg.attributes.height || "100");
    return { x: 0, y: 0, width: w, height: h };
  }
}

// export const TEST_SVG = `<svg
//    width="155.87535mm"
//    height="109.14164mm"
//    viewBox="0 0 155.87535 109.14164"
//    id="svg1"
//    xml:space="preserve"
//    xmlns="http://www.w3.org/2000/svg"
//    xmlns:svg="http://www.w3.org/2000/svg"><defs
//      id="defs1" /><g
//      id="layer1"
//      transform="translate(-23.473472,-11.525123)"><path
//        id="path47-5"
//        fill="blue"
//        stroke="none"
//        stroke-width="0"
//        d="m -412.68377,440.70919 h 226.7821 V 147.49885 L -260.86471,72.535806 H -727.42173 V 361.07619 h 231.92697 c 2.11973,0 4.039,0.861 5.42586,2.2511 z m -221.5314,-1.2587 h -37.19724 l -46.44522,-46.9004 h 37.19726 z m 58.20135,0 h -37.19724 l -46.4452,-46.9004 h 37.19724 z m 58.20761,0 h -37.19889 l -46.44259,-46.9004 h 37.19791 z m 58.20892,0 h -37.19889 l -46.44357,-46.9004 h 37.19561 z M -193.64117,101.4398 -251.52145,43.559516 h -66.27377 l -13.49072,13.62218 h -403.81384 c -4.24014,0 -7.67771,3.43758 -7.67771,7.67705 V 368.75319 c 0,4.2428 3.43757,7.6804 7.67771,7.6804 h 236.42377 l 76.33348,76.3301 c 1.38686,1.9949 3.69392,3.2996 6.30662,3.2996 h 237.81129 c 4.23947,0 7.67706,-3.4376 7.67706,-7.6771 v -221.4055 l 16.9053,-16.741 v -68.80098 l -39.99891,-39.99891"
//        style="fill:#0e0f0e;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:0.032864"
//        transform="matrix(0.26458333,0,0,0.26458333,220.00001,0)" /></g></svg>
// `;
//
// export const PARSED = {
//   "name": "svg",
//   "type": "element",
//   "value": "",
//   "parent": null,
//   "attributes": {
//     "width": "155.87535mm",
//     "height": "109.14164mm",
//     "viewBox": "0 0 155.87535 109.14164",
//     "version": "1.1",
//     "id": "svg1",
//     "xml:space": "preserve",
//     "xmlns": "http://www.w3.org/2000/svg",
//     "xmlns:svg": "http://www.w3.org/2000/svg"
//   },
//   "children": [
//     {
//       "name": "defs",
//       "type": "element",
//       "value": "",
//       "parent": null,
//       "attributes": {
//         "id": "defs1"
//       },
//       "children": []
//     },
//     {
//       "name": "g",
//       "type": "element",
//       "value": "",
//       "parent": null,
//       "attributes": {
//         "id": "layer1"
//       },
//       "children": [
//         {
//           "name": "path",
//           "type": "element",
//           "value": "",
//           "parent": null,
//           "attributes": {
//             "id": "path47-5",
//             "d": "M87.33729189644592 105.07918205180269h60.002763202393005V27.5006139041705L127.50608434871572 7.6666420957139785H4.062874362239114V84.0096177339127h61.364010039410104c0.5608452221009 0 1.06865206987 0.22780624713 1.4355921069138 0.595603534163z m-58.613515511562-0.333031037471h-9.841769626009201l-12.2886309701826-12.409064010332h9.8417749176758z m15.399106993495499 0h-9.841769626009201l-12.288625678516-12.409064010332h9.841769626009201z m15.4007632851413 0h-9.8422061885037l-12.2879351160247-12.409064010332h9.8419468968403z m15.4011098893036 0h-9.8422061885037l-12.288194407688101-12.409064010332h9.841338355181302zM145.29231241630393 15.314157078534002L129.97815519257153-0.0000012035317205061347h-17.5349347582541l-3.5694196216976 3.6042017462594003h-106.84241048728721c-1.1218703608662002 0-2.0313940785743 0.9095263635414-2.0313940785743 2.0312194535765V86.0408239583227c0 1.122574152524 0.9095237177081 2.032105807732 2.0313940785743 2.032105807732h62.5537883577541l20.196566328888398 20.195672037233003c0.3669400370438 0.527817285017 0.9773496543536 0.873019155668 1.6686265206446 0.873019155668h62.9209030197957c1.1216930900351 0 2.0312220994098-0.9095316552080001 2.0312220994098-2.031232682743v-58.580204470314996l4.472860568649001-4.42938952753v-18.2035923956634l-10.583044804170301-10.583044804170301",
//             "style": "fill:#0e0f0e;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:0.032864"
//           },
//           "children": []
//         }
//       ]
//     }
//   ]
// };
