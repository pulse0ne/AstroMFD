import {fastCopy} from "./fastCopy.ts";
import {v4 as uuid} from "uuid";
import {Widget} from "@common/shared/models";

export function duplicateWidget(widget: Widget): Widget {
  return Object.assign({}, fastCopy(widget), { id: uuid() });
}
