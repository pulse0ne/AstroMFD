import type {
  ActionStep,
  Gradient,
  InputKey,
  JoystickAxis,
  PanelAttributes,
} from "@common/shared/models";
import { Fragment, useMemo, type CSSProperties } from "react";

import { gradientString } from "../utils.ts";
import { Button } from "./Button.tsx";
import { Label } from "./Label.tsx";
import { Slider } from "./Slider.tsx";
import { SvgRenderer } from "./SvgRenderer.tsx";

export type PanelProps = {
  attr: PanelAttributes;
  onExecuteActions: (steps: ActionStep[]) => void;
  onDown: (key: InputKey) => void;
  onUp: (key: InputKey) => void;
  onNavigate: (target: string) => void;
  onAxisMove: (axis: JoystickAxis, value: number) => void;
};

export function Panel({
  attr,
  onExecuteActions,
  onDown,
  onUp,
  onNavigate,
  onAxisMove,
}: PanelProps) {
  const fill = useMemo(() => {
    const f = attr.shape.fill;
    if (!f) return null;
    if (f.type === "solid") {
      return f.value as string;
    } else {
      return gradientString(f.value as Gradient);
    }
  }, [attr]);

  const containerStyle: CSSProperties = {
    position: "absolute",
    left: attr.shape.position.x,
    top: attr.shape.position.y,
    width: attr.shape.size.width,
    height: attr.shape.size.height,
    overflow: "hidden",
    background: attr.shape.svg ? undefined : (fill ?? "transparent"),
    borderWidth: attr.shape.svg ? undefined : attr.shape.strokeWidth,
    borderStyle: attr.shape.svg ? undefined : "solid",
    borderColor: attr.shape.svg
      ? undefined
      : (attr.shape.stroke ?? "transparent"),
    borderRadius: attr.shape.svg ? undefined : attr.shape.cornerRadius,
  };

  return (
    <div style={containerStyle}>
      {attr.shape.svg && (
        <SvgRenderer
          svg={attr.shape.svg}
          width={attr.shape.size.width}
          height={attr.shape.size.height}
        />
      )}
      {attr.widgets.map((widget) => (
        <Fragment key={widget.id}>
          {widget.type === "button" && (
            <Button
              attr={widget}
              onExecuteActions={onExecuteActions}
              onDown={onDown}
              onUp={onUp}
              onNavigate={onNavigate}
            />
          )}
          {widget.type === "slider" && (
            <Slider attr={widget} onAxisMove={onAxisMove} />
          )}
          {widget.type === "panel" && (
            <Panel
              attr={widget}
              onExecuteActions={onExecuteActions}
              onDown={onDown}
              onUp={onUp}
              onNavigate={onNavigate}
              onAxisMove={onAxisMove}
            />
          )}
          {widget.type === "label" && <Label attr={widget} />}
        </Fragment>
      ))}
    </div>
  );
}
