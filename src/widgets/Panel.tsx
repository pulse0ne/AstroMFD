import {WidgetPropsBase} from "./WidgetPropsBase.ts";
import {PanelAttributes} from "../types/widget.ts";

export type PanelProps = WidgetPropsBase & {
  attr: PanelAttributes;
};

export function Panel({ attr }: PanelProps) {
  console.log(attr);
  return <></>;
}