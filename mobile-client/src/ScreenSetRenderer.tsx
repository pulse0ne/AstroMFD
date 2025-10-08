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
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
        onClick={onExit}
      >
        <svg height="20px" width="20px" version="1.1" viewBox="0 0 512 512" fill="white">
          <path d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"/>
        </svg>
      </div>
    </div>
  );
}