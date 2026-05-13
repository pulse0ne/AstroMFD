import { Screen } from "@common/shared/models";
import { v4 as uuid } from "uuid";

export function createScreen(screenNum: number = 1): Screen {
  return {
    id: uuid(),
    name: `Untitled screen ${screenNum}`,
    backgroundColor: "black",
    crtEffect: false,
    widgets: [],
  };
}
