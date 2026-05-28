import type {
  ActionStep,
  InputKey,
  JoystickAxis,
  Screen,
  Size,
} from "@common/shared/models";
import { Fragment, type CSSProperties } from "react";

import { Button } from "./widgets/Button.tsx";
import { Carousel } from "./widgets/Carousel.tsx";
import { ImageWidget } from "./widgets/ImageWidget.tsx";
import { Label } from "./widgets/Label.tsx";
import { Panel } from "./widgets/Panel.tsx";
import { Slider } from "./widgets/Slider.tsx";

export type ScreenRendererProps = {
  screen: Screen;
  screenSetId: string;
  size: Size;
  onNavigate: (target: string) => void;
  onMessage: (msg: any) => void;
};

export function ScreenRenderer({
  screen,
  screenSetId,
  size,
  onNavigate,
  onMessage,
}: ScreenRendererProps) {
  const bgStyle: CSSProperties = {
    position: "relative",
    backgroundColor: screen.backgroundColor,
    width: size.width,
    height: size.height,
  };

  const handleExecuteActions = (steps: ActionStep[]) => {
    onMessage({ executeActions: { screenSetId, steps } });
  };

  const handleDown = (key: InputKey) => {
    onMessage({ keyDown: { key } });
  };

  const handleUp = (key: InputKey) => {
    onMessage({ keyUp: { key } });
  };

  const handleAxisMove = (axis: JoystickAxis, value: number) => {
    onMessage({ axisMove: { axis, value } });
  };

  return (
    <div style={bgStyle}>
      {screen?.effects?.scanlines && (
        <div style={{ position: "absolute" }} className="fill scanlines"></div>
      )}
      {screen?.effects?.lcdGrid && (
        <div style={{ position: "absolute" }} className="fill lcd-grid"></div>
      )}
      {screen?.effects?.vignette && (
        <div style={{ position: "absolute" }} className="fill vignette"></div>
      )}
      {screen?.effects?.phosphorGlow && (
        <div
          style={{ position: "absolute" }}
          className="fill phosphor-glow"
        ></div>
      )}
      {screen?.effects?.flicker && (
        <div style={{ position: "absolute" }} className="fill flicker"></div>
      )}
      {screen?.effects?.chromaticAberration && (
        <div
          style={{ position: "absolute" }}
          className="fill chromatic-aberration"
        ></div>
      )}
      {screen?.effects?.noise && (
        <div style={{ position: "absolute" }} className="fill noise"></div>
      )}
      {screen.widgets.map((widget) => (
        <Fragment key={widget.id}>
          {widget.type === "button" && (
            <Button
              attr={widget}
              onExecuteActions={handleExecuteActions}
              onDown={handleDown}
              onUp={handleUp}
              onNavigate={onNavigate}
            />
          )}
          {widget.type === "slider" && (
            <Slider attr={widget} onAxisMove={handleAxisMove} />
          )}
          {widget.type === "panel" && (
            <Panel
              attr={widget}
              onExecuteActions={handleExecuteActions}
              onDown={handleDown}
              onUp={handleUp}
              onNavigate={onNavigate}
              onAxisMove={handleAxisMove}
            />
          )}
          {widget.type === "label" && <Label attr={widget} />}
          {widget.type === "image" && <ImageWidget attr={widget} screenSetId={screenSetId} />}
          {widget.type === "carousel" && (
            <Carousel
              attr={widget}
              onExecuteActions={handleExecuteActions}
              onDown={handleDown}
              onUp={handleUp}
              onNavigate={onNavigate}
              onAxisMove={handleAxisMove}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
