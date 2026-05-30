import type { ScreenSet } from "@common/shared/models";
import { useEffect, useState } from "react";

import { ScreenSetRenderer } from "./ScreenSetRenderer.tsx";
import { useAppWebsocket } from "./websocket/WebsocketContext.tsx";

type LayoutPushedEvent = {
  id: string;
  screenSet: ScreenSet;
};

function useWebsocketListener<T>(messageType: string) {
  const { lastMessage } = useAppWebsocket();
  const [message, setMessage] = useState<T | null>(null);
  useEffect(() => {
    if (lastMessage && lastMessage[messageType]) {
      setMessage(lastMessage[messageType] as T);
    }
  }, [lastMessage]);

  return message;
}

function collectFontNames(screenSets: ScreenSet[]): string[] {
  const names = new Set<string>();
  for (const screenSet of screenSets) {
    for (const screen of screenSet.screens) {
      for (const widget of screen.widgets) {
        if (widget.type === "button" || widget.type === "label" || widget.type === "slider") {
          if (widget.text.font?.name) names.add(widget.text.font.name);
        }
      }
    }
  }
  return Array.from(names);
}

export function ScreenSetManager() {
  const [screenSets, setScreenSets] = useState<ScreenSet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const layoutPushedMessage =
    useWebsocketListener<LayoutPushedEvent>("layoutPushed");

  useEffect(() => {
    fetch("/screen-sets")
      .then((r) => r.json() as Promise<ScreenSet[]>)
      .then((ss) => setScreenSets(ss))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    const fontNames = collectFontNames(screenSets);
    fontNames.forEach((name) => {
      const face = new FontFace(
        name,
        `url(/fonts/${encodeURIComponent(name)}.woff2)`,
      );
      document.fonts.add(face);
      face.load().catch(() => {});
    });
  }, [screenSets]);

  useEffect(() => {
    const targetIx = screenSets.findIndex(
      (s) => s.id === layoutPushedMessage?.id,
    );
    if (targetIx > -1) {
      console.log("updating layout");
      setScreenSets((ov) => {
        const copy = JSON.parse(JSON.stringify(ov)) as ScreenSet[];
        copy[targetIx] = layoutPushedMessage!.screenSet;
        return copy;
      });
    }
  }, [layoutPushedMessage]);

  const selectedScreenSet = screenSets.find((i) => i.id === selectedId);

  return (
    <div style={{ overflow: "hidden" }}>
      {selectedId === null && (
        <div style={{ overflowY: "auto", margin: 12 }}>
          <h2 style={{ margin: 0 }}>Screen Sets</h2>
          {screenSets.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "8px 12px",
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
