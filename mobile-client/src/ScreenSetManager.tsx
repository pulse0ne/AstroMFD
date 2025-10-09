import {useAppWebsocket} from "./websocket/WebsocketContext.tsx";
import {useEffect, useState} from "react";
import type {FontSpec, ScreenSet} from "@common/shared/models";
import {ScreenSetRenderer} from "./ScreenSetRenderer.tsx";

type LayoutPushedEvent = {
  id: string;
  screenSet: ScreenSet;
};

function useWebsocketListener<T>(messageType: string) {
  const { lastMessage } = useAppWebsocket();
  const [ message, setMessage ] = useState<T|null>(null);
  useEffect(() => {
    if (lastMessage && lastMessage[messageType]) {
      setMessage(lastMessage[messageType] as T);
    }
  }, [lastMessage]);

  return message;
}

function collectFonts(screenSets: ScreenSet[]): FontSpec[] {
  return screenSets.flatMap(screenSet => {
    return screenSet.screens.flatMap(screen => {
      return screen.widgets.map(widget => {
        if (widget.type === "button") {
          return widget.text.font;
        } else if (widget.type === "label") {
          return widget.text.font;
        } else {
          return null;
        }
      }).filter(r => r !== null);
    });
  });
}

export function ScreenSetManager() {
  const [ screenSets, setScreenSets ] = useState<ScreenSet[]>([]);
  const [ selectedId, setSelectedId ] = useState<string|null>(null);
  const layoutPushedMessage = useWebsocketListener<LayoutPushedEvent>("layoutPushed");

  useEffect(() => {
    fetch("/screen-sets")
      .then(r => r.json() as Promise<ScreenSet[]>)
      .then(ss => setScreenSets(ss))
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    const fontSpecs = collectFonts(screenSets);
    const fonts = fontSpecs.map(font => new FontFace(font.name, `url(/fonts/${font.postscriptName}.${font.format})`));
    fonts.forEach(f => {
      document.fonts.add(f);
      f.load().catch(e => console.error(e));
    });
  }, [screenSets]);

  useEffect(() => {
    const targetIx = screenSets.findIndex(s => s.id === layoutPushedMessage?.id);
    if (targetIx > -1) {
      console.log("updating layout");
      setScreenSets(ov => {
        const copy = JSON.parse(JSON.stringify(ov)) as ScreenSet[];
        copy[targetIx] = layoutPushedMessage!.screenSet;
        return copy;
      });
    }
  }, [layoutPushedMessage]);

  const selectedScreenSet = screenSets.find(i => i.id === selectedId);

  return (
    <div style={{ overflow: "hidden" }}>
      {selectedId === null && (
        <div style={{ overflowY: "auto", margin: 12 }}>
          <h2 style={{ margin: 0 }}>Screen Sets</h2>
          {screenSets.map(s => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "8px 12px"
              }}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
      {selectedScreenSet && (
        <ScreenSetRenderer
          screenSet={selectedScreenSet}
          onExit={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
