import {WidgetPropsBase} from "./WidgetPropsBase.ts";
import {Button} from "./Button.tsx";
import {Widget} from "../types/widget.ts";
import {Label} from "./Label.tsx";
import {Panel} from "./Panel.tsx";

export type WidgetRendererProps = WidgetPropsBase & {
  widget: Widget;
  state: "primary" | "pressed";
};

export function WidgetRenderer({ widget, onSelect, onUpdate, isSelected, state }: WidgetRendererProps) {
  if (widget.type === "button") {
    return <Button onSelect={onSelect} onUpdate={onUpdate} attr={widget} isSelected={isSelected} state={state} />;
  } else if (widget.type === "label") {
    return <Label onSelect={onSelect} onUpdate={onUpdate} attr={widget} isSelected={isSelected} />;
  } else if (widget.type === "panel") {
    return <Panel onSelect={onSelect} onUpdate={onUpdate} attr={widget} isSelected={isSelected} />;
  } else {
    return null;
  }
}
