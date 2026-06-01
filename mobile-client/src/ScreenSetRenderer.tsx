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
        screenSetId={screenSet.id}
        size={screenSet.size}
        onNavigate={handleNavigate}
        onMessage={sendMessage}
        onExit={onExit}
      />
    </div>
  );
}
