import {useAppWebsocket} from "./websocket/WebsocketContext.tsx";
import {useEffect, useState} from "react";
import type {ScreenSet} from "@common/shared/models";
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
          {screenSets.map(s => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
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
