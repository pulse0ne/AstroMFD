import { ButtonAttributes, Screen } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createScreen(screenNum: number = 1): Screen {
  return {
    id: uuid(),
    name: `Untitled screen ${screenNum}`,
    backgroundColor: "rgba(13, 20, 24, 1)",
    crtEffect: false,
    effects: {
      scanlines: false,
      lcdGrid: false,
      phosphorGlow: false,
      vignette: false,
      flicker: false,
      chromaticAberration: false,
      noise: false,
    },
    widgets: [
      createExitButton()
    ],
  };
}

function createExitButton(): ButtonAttributes {
  return {
    id: uuid(),
    type: "button",
    buttonType: "exit",
    input: {
      steps: []
    },
    text: {
      fontSize: 12,
      font: null,
      fontColor: null,
      text: null,
      shadow: null,
      horizontalAlignment: "center",
      verticalAlignment: "middle"
    },
    icon: null,
    shape: {
      svg: {
        name: "svg",
        type: "element",
        value: "",
        parent: null,
        attributes: {
          viewbox: "0 0 24 24",
          height: "24px",
          width: "24px"
        },
        children: [
          {
            name: "path",
            type: "element",
            value: "",
            parent: null,
            attributes: {
              d: "M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm6,12H8.414l2.293,2.293a1,1,0,1,1-1.414,1.414l-4-4a1,1,0,0,1,0-1.414l4-4a1,1,0,1,1,1.414,1.414L8.414,11H18a1,1,0,0,1,0,2Z",
              fill: "rgba(128, 128, 128, 0.6)"
            },
            children: []
          }
        ]
      },
      fill: null,
      stroke: null,
      cornerRadius: 0,
      position: {
        x: 5,
        y: 5,
      },
      strokeWidth: 0,
      shadow: null,
      size: {
        height: 24,
        width: 24
      }
    },
    navTarget: null,
    pressed: { shape: {}, text: {} }
  };
}

/**
 *         <svg
   viewBox="0 0 24 24"
   fill="rgba(128, 128, 128, 0.6)"
   width="24px"
   height="24px"
 >
   <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm6,12H8.414l2.293,2.293a1,1,0,1,1-1.414,1.414l-4-4a1,1,0,0,1,0-1.414l4-4a1,1,0,1,1,1.414,1.414L8.414,11H18a1,1,0,0,1,0,2Z" />
 </svg>
 */
