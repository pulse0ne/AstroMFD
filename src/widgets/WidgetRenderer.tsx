import { Widget } from "@common/shared/models";

import { Button } from "./Button.tsx";
import { Carousel } from "./Carousel.tsx";
import { ImageWidget } from "./ImageWidget.tsx";
import { Label } from "./Label.tsx";
import { Panel } from "./Panel.tsx";
import { Slider } from "./Slider.tsx";
import { WidgetPropsBase } from "./WidgetPropsBase.ts";

export type WidgetRendererProps = WidgetPropsBase & {
  widget: Widget;
  state: "primary" | "pressed";
};

export function WidgetRenderer({
  widget,
  screenSetId,
  onSelect,
  onCommitUpdate,
  onEphemeralUpdate,
  onDragSnap,
  isSelected,
  state,
}: WidgetRendererProps) {
  const base = { screenSetId, onSelect, onCommitUpdate, onEphemeralUpdate, onDragSnap, isSelected };

  if (widget.type === "button") {
    return <Button {...base} attr={widget} state={state} />;
  } else if (widget.type === "label") {
    return <Label {...base} attr={widget} />;
  } else if (widget.type === "panel") {
    return <Panel {...base} attr={widget} />;
  } else if (widget.type === "slider") {
    return <Slider {...base} attr={widget} />;
  } else if (widget.type === "carousel") {
    return <Carousel {...base} attr={widget} />;
  } else if (widget.type === "image") {
    return <ImageWidget {...base} attr={widget} />;
  } else {
    return null;
  }
}
