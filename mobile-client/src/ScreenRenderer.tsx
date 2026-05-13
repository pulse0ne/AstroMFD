import type { InputKey, Screen, Size } from "@common/shared/models";
import { Fragment, type CSSProperties } from "react";

import { Button } from "./widgets/Button.tsx";
import { Label } from "./widgets/Label.tsx";
import { Panel } from "./widgets/Panel.tsx";

export type ScreenRendererProps = {
  screen: Screen;
  size: Size;
  onNavigate: (target: string) => void;
  onMessage: (msg: any) => void;
};

export function ScreenRenderer({
  screen,
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

  const handlePress = (key: InputKey, duration: number) => {
    onMessage({ fixedPress: { key, duration } });
  };

  const handleDown = (key: InputKey) => {
    onMessage({ keyDown: { key } });
  };

  const handleUp = (key: InputKey) => {
    onMessage({ keyUp: { key } });
  };

  return (
    <div style={bgStyle}>
      {screen?.crtEffect && (
        <div style={{ position: "absolute" }} className="fill scanlines"></div>
      )}
      {screen.widgets.map((widget) => (
        <Fragment key={widget.id}>
          {widget.type === "button" && (
            <Button
              attr={widget}
              onPress={handlePress}
              onDown={handleDown}
              onUp={handleUp}
              onNavigate={onNavigate}
            />
          )}
          {widget.type === "panel" && <Panel attr={widget} />}
          {widget.type === "label" && <Label attr={widget} />}
        </Fragment>
      ))}
    </div>
  );
}
