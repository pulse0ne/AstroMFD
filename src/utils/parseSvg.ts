import {parseSync} from "xml-reader";
import {SvgXmlNode} from "@common/shared/models";
import {flattenXmlNodeTransforms} from "./flattenSvgTransforms.ts";

export const TEST_SVG = `<svg
   width="155.87535mm"
   height="109.14164mm"
   viewBox="0 0 155.87535 109.14164"
   version="1.1"
   id="svg1"
   xml:space="preserve"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg"><defs
     id="defs1" /><g
     id="layer1"
     transform="translate(-23.473472,-11.525123)"><path
       id="path47-5"
       d="m -412.68377,440.70919 h 226.7821 V 147.49885 L -260.86471,72.535806 H -727.42173 V 361.07619 h 231.92697 c 2.11973,0 4.039,0.861 5.42586,2.2511 z m -221.5314,-1.2587 h -37.19724 l -46.44522,-46.9004 h 37.19726 z m 58.20135,0 h -37.19724 l -46.4452,-46.9004 h 37.19724 z m 58.20761,0 h -37.19889 l -46.44259,-46.9004 h 37.19791 z m 58.20892,0 h -37.19889 l -46.44357,-46.9004 h 37.19561 z M -193.64117,101.4398 -251.52145,43.559516 h -66.27377 l -13.49072,13.62218 h -403.81384 c -4.24014,0 -7.67771,3.43758 -7.67771,7.67705 V 368.75319 c 0,4.2428 3.43757,7.6804 7.67771,7.6804 h 236.42377 l 76.33348,76.3301 c 1.38686,1.9949 3.69392,3.2996 6.30662,3.2996 h 237.81129 c 4.23947,0 7.67706,-3.4376 7.67706,-7.6771 v -221.4055 l 16.9053,-16.741 v -68.80098 l -39.99891,-39.99891"
       style="fill:#0e0f0e;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:0.032864"
       transform="matrix(0.26458333,0,0,0.26458333,220.00001,0)" /></g></svg>
`;

// transform="matrix(0.26458333, 0, 0, 0.26458333, 220.00001, 0)"
// scale(0.26458333, 0.26458333) translate(220.00001 / 0.26458333, 0)
//


const PARSED = {
  "name": "svg",
  "type": "element",
  "value": "",
  "parent": null,
  "attributes": {
    "width": "155.87535mm",
    "height": "109.14164mm",
    "viewBox": "0 0 155.87535 109.14164",
    "version": "1.1",
    "id": "svg1",
    "xml:space": "preserve",
    "xmlns": "http://www.w3.org/2000/svg",
    "xmlns:svg": "http://www.w3.org/2000/svg"
  },
  "children": [
    {
      "name": "defs",
      "type": "element",
      "value": "",
      "parent": null,
      "attributes": {
        "id": "defs1"
      },
      "children": []
    },
    {
      "name": "g",
      "type": "element",
      "value": "",
      "parent": null,
      "attributes": {
        "id": "layer1",
        "transform": "translate(-23.473472,-11.525123)"
      },
      "children": [
        {
          "name": "path",
          "type": "element",
          "value": "",
          "parent": null,
          "attributes": {
            "id": "path47-5",
            "d": "m -412.68377,440.70919 h 226.7821 V 147.49885 L -260.86471,72.535806 H -727.42173 V 361.07619 h 231.92697 c 2.11973,0 4.039,0.861 5.42586,2.2511 z m -221.5314,-1.2587 h -37.19724 l -46.44522,-46.9004 h 37.19726 z m 58.20135,0 h -37.19724 l -46.4452,-46.9004 h 37.19724 z m 58.20761,0 h -37.19889 l -46.44259,-46.9004 h 37.19791 z m 58.20892,0 h -37.19889 l -46.44357,-46.9004 h 37.19561 z M -193.64117,101.4398 -251.52145,43.559516 h -66.27377 l -13.49072,13.62218 h -403.81384 c -4.24014,0 -7.67771,3.43758 -7.67771,7.67705 V 368.75319 c 0,4.2428 3.43757,7.6804 7.67771,7.6804 h 236.42377 l 76.33348,76.3301 c 1.38686,1.9949 3.69392,3.2996 6.30662,3.2996 h 237.81129 c 4.23947,0 7.67706,-3.4376 7.67706,-7.6771 v -221.4055 l 16.9053,-16.741 v -68.80098 l -39.99891,-39.99891",
            "style": "fill:#0e0f0e;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:0.032864",
            "transform": "matrix(0.26458333,0,0,0.26458333,220.00001,0)"
          },
          "children": []
        }
      ]
    }
  ]
};


export function parse(rawText: string): SvgXmlNode {
  const parsed = parseSync(`<root>${rawText}</root>`, { parentNodes: false });
  const isValid = parsed.children && parsed.children.length === 1 && parsed.children.every(n => n.name === "svg");
  if (isValid) {
    return flattenXmlNodeTransforms(parsed.children[0]);
  }
  throw Error("failed to parse svg");
}

export function stringify(svg: SvgXmlNode): string {
  return ""; // TODO
}

