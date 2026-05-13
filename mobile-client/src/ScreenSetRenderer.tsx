import type { ScreenSet } from "@common/shared/models";
import { useState } from "react";

import { ScreenRenderer } from "./ScreenRenderer.tsx";
import { useAppWebsocket } from "./websocket/WebsocketContext.tsx";

export type ScreenSetRendererProps = {
  screenSet: ScreenSet;
  onExit: () => void;
};

export function ScreenSetRenderer({
  screenSet,
  onExit,
}: ScreenSetRendererProps) {
  const [selectedScreenId, setSelectedScreenId] = useState<string>(
    screenSet.screens[0].id,
  );
  const { sendMessage } = useAppWebsocket();

  const handleNavigate = (target: string) => {
    setSelectedScreenId(target);
  };

  const selectedScreen =
    screenSet.screens.find((s) => s.id === selectedScreenId) ??
    screenSet.screens[0];
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={onExit}
      >
        <svg
          viewBox="0 0 24 24"
          fill="rgba(128, 128, 128, 0.6)"
          width="24px"
          height="24px"
        >
          <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm6,12H8.414l2.293,2.293a1,1,0,1,1-1.414,1.414l-4-4a1,1,0,0,1,0-1.414l4-4a1,1,0,1,1,1.414,1.414L8.414,11H18a1,1,0,0,1,0,2Z" />
        </svg>
      </div>
    </div>
  );
}
