import { Screen } from "@common/shared/models";
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
    widgets: [],
  };
}
