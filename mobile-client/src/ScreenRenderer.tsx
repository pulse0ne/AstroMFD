import {type CSSProperties, Fragment} from "react";
import type {Screen, Size} from "@common/shared/models";
import {Button} from "./widgets/Button.tsx";
import {Panel} from "./widgets/Panel.tsx";
import {Label} from "./widgets/Label.tsx";

export type ScreenRendererProps = {
  screen: Screen;
  size: Size;
  onNavigate: (target: string) => void;
  onMessage: (msg: any) => void;
};

export function ScreenRenderer({ screen, size, onNavigate, onMessage }: ScreenRendererProps) {
  const bgStyle: CSSProperties = {
    position: "relative",
    backgroundColor: screen.backgroundColor,
    width: size.width,
    height: size.height,
  };

  const handlePress = (button: number, duration: number) => {
    onMessage({ press: { button, duration }});
  };

  return (
    <div style={bgStyle}>
      {screen.widgets.map(widget => (
        <Fragment key={widget.id}>
          {widget.type === "button" && (
            <Button attr={widget} onPress={handlePress} onNavigate={onNavigate} />
          )}
          {widget.type === "panel" && (
            <Panel attr={widget} />
          )}
          {widget.type === "label" && (
            <Label attr={widget} />
          )}
        </Fragment>
      ))}
    </div>
  );
}