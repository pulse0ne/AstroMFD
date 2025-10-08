import {useState} from "react";
import type {ScreenSet} from "@common/shared/models";
import {ScreenRenderer} from "./ScreenRenderer.tsx";
import {useAppWebsocket} from "./websocket/WebsocketContext.tsx";

export type ScreenSetRendererProps = {
  screenSet: ScreenSet;
  onExit: () => void;
};

export function ScreenSetRenderer({ screenSet, onExit }: ScreenSetRendererProps) {
  const [ selectedScreenId, setSelectedScreenId ] = useState<string>(screenSet.screens[0].id);
  const { sendMessage } = useAppWebsocket();

  const handleNavigate = (target: string) => {
    setSelectedScreenId(target);
  };

  const selectedScreen = screenSet.screens.find(s => s.id === selectedScreenId) ?? screenSet.screens[0];
  return (
    <div className="relative">
      <ScreenRenderer
        screen={selectedScreen}
        size={screenSet.size}
        onNavigate={handleNavigate}
        onMessage={sendMessage}
      />
      <div style={{ position: "absolute", left: 0, top: 0 }} onClick={onExit}>
        X
      </div>
    </div>
  );
}