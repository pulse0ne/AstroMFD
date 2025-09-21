import {WidgetPropsBase} from "./WidgetPropsBase.ts";
import {LabelAttributes} from "../types/widget.ts";

export type LabelProps = WidgetPropsBase & {
  attr: LabelAttributes;
};

export function Label({ attr }: LabelProps) {
  console.log(attr);
  return <></>;
}
