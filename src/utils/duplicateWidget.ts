import { Widget } from "@common/shared/models";
import { v4 as uuid } from "uuid";

import { fastCopy } from "./fastCopy.ts";

export function duplicateWidget(widget: Widget): Widget {
  return Object.assign({}, fastCopy(widget), { id: uuid() });
}
