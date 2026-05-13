import { Screen } from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import useTauriListen from "../hooks/useTauriListen.tsx";
import { useECStore } from "../store";
import { EditableTitle } from "./EditableTitle.tsx";

import "./screen-selector.css";

type ImageUpdatedMessage = {
  id: string;
};

export function ScreenSelector() {
  const screenSet = useECStore((state) => state.screenSet);
  const activeScreenIndex = useECStore((state) => state.activeScreenIndex);
  const setActiveScreenIndex = useECStore(
    (state) => state.setActiveScreenIndex,
  );
  const updateScreen = useECStore((state) => state.updateScreen);
  const [screenImages, setScreenImages] = useState<Record<string, string>>({});
  const { lastEvent } = useTauriListen<ImageUpdatedMessage>(
    "screen-image-updated",
  );

  useEffect(() => {
    if (!screenSet) return;
    const screenIds = Object.keys(screenImages);
    screenSet.screens
      .filter((s) => !screenIds.includes(s.id))
      .forEach((s) => {
        invoke<ArrayBuffer>("get_screen_img", { id: s.id })
          .then((buf) => {
            const blob = new Blob([buf], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            setScreenImages((ov) => ({ ...ov, [s.id]: url }));
          })
          .catch((e) => console.error(e));
      });
  }, [screenSet]);

  useEffect(() => {
    if (!lastEvent) return;
    const imageId = lastEvent.id;
    invoke<ArrayBuffer>("get_screen_img", { id: imageId })
      .then((buf) => {
        const blob = new Blob([buf], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        setScreenImages((ov) => Object.assign({}, ov, { [imageId]: url }));
      })
      .catch((e) => console.error(e));
  }, [lastEvent]);

  const handleScreenRename = (name: string) => {
    if (!screenSet || activeScreenIndex === null) return;
    const updatedScreen: Screen = Object.assign(
      {},
      screenSet.screens[activeScreenIndex],
      { name },
    );
    updateScreen(updatedScreen);
  };

  return (
    <div className="screen-selector fill-y col align-items-center">
      <div className="fill-x m16-t m16-b border-b">
        <h5 className="text-center">Screens</h5>
      </div>
      <div className="flex-x flex-grow col align-items-center gap-16">
        {screenSet?.screens?.map((screen, ix) => (
          <div className="col align-items-center" key={screen.id}>
            <div
              className="pointer border screen-selector-screen-container"
              style={{
                borderColor:
                  ix === activeScreenIndex
                    ? "var(--gradient-stop1)"
                    : undefined,
              }}
              onClick={() => setActiveScreenIndex(ix)}
            >
              {screenImages[screen.id] && (
                <img
                  src={screenImages[screen.id]}
                  alt={screenImages[screen.id]}
                  width={62}
                  height={62}
                />
              )}
            </div>
            <EditableTitle
              style={{
                textAlign: "center",
                fontSize: 10,
                color:
                  ix === activeScreenIndex
                    ? "var(--gradient-stop1)"
                    : undefined,
              }}
              inputStyle={{ fontSize: 10, textAlign: "center" }}
              value={screen.name}
              onChange={handleScreenRename}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
