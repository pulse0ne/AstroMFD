import { v4 as uuid } from "uuid";
import {Screen} from "@common/shared/models";

export function createScreen(screenNum: number = 1): Screen {
  return {
    id: uuid(),
    name: `Untitled screen ${screenNum}`,
    backgroundColor: "black",
    crtEffect: false,
    widgets: []
  };
}
