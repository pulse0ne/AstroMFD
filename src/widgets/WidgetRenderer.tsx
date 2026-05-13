import { Widget } from "@common/shared/models";

import { Button } from "./Button.tsx";
import { Label } from "./Label.tsx";
import { Panel } from "./Panel.tsx";
import { WidgetPropsBase } from "./WidgetPropsBase.ts";

export type WidgetRendererProps = WidgetPropsBase & {
  widget: Widget;
  state: "primary" | "pressed";
};

export function WidgetRenderer({
  widget,
  onSelect,
  onCommitUpdate,
  onEphemeralUpdate,
  isSelected,
  state,
}: WidgetRendererProps) {
  if (widget.type === "button") {
    return (
      <Button
        onSelect={onSelect}
        onCommitUpdate={onCommitUpdate}
        onEphemeralUpdate={onEphemeralUpdate}
        attr={widget}
        isSelected={isSelected}
        state={state}
      />
    );
  } else if (widget.type === "label") {
    return (
      <Label
        onSelect={onSelect}
        onCommitUpdate={onCommitUpdate}
        onEphemeralUpdate={onEphemeralUpdate}
        attr={widget}
        isSelected={isSelected}
      />
    );
  } else if (widget.type === "panel") {
    return (
      <Panel
        onSelect={onSelect}
        onCommitUpdate={onCommitUpdate}
        onEphemeralUpdate={onEphemeralUpdate}
        attr={widget}
        isSelected={isSelected}
      />
    );
  } else {
    return null;
  }
}
