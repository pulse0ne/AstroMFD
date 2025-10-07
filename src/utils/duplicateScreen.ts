import {fastCopy} from "./fastCopy.ts";
import {v4 as uuid} from "uuid";
import {Screen} from "@common/shared/models";

export function duplicateScreen(screen: Screen): Screen {
  const copy = fastCopy(screen);
  copy.widgets = copy.widgets.map(w => {
    w.id = uuid();
    return w;
  });
  return Object.assign({}, copy, { id: uuid() });
}
