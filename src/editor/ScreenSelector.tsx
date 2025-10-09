import {useEffect, useState} from "react";
import useTauriListen from "../hooks/useTauriListen.tsx";
import {useECStore} from "../store";
import {invoke} from "@tauri-apps/api/core";

type ImageUpdatedMessage = {
  id: string;
};

export function ScreenSelector() {
  const screenSet = useECStore(state => state.screenSet);
  const activeScreenIndex = useECStore(state => state.activeScreenIndex);
  const setActiveScreenIndex = useECStore(state => state.setActiveScreenIndex);
  const [ screenImages, setScreenImages ] = useState<Record<string, string>>({});
  const { lastEvent } = useTauriListen<ImageUpdatedMessage>("screen-image-updated");

  useEffect(() => {
    if (!screenSet) return;
    const screenIds = Object.keys(screenImages);
    screenSet.screens
      .filter(s => !screenIds.includes(s.id))
      .forEach(s => {
        invoke<ArrayBuffer>("get_screen_img", { id: s.id })
          .then(buf => {
            const blob = new Blob([buf], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            setScreenImages(ov => ({ ...ov, [s.id]: url }));
          })
          .catch(e => console.error(e));
      });
  }, [screenSet]);

  useEffect(() => {
    if (!lastEvent) return;
    const imageId = lastEvent.id;
    invoke<ArrayBuffer>("get_screen_img", { id: imageId })
      .then(buf => {
        const blob = new Blob([buf], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        setScreenImages(ov => Object.assign({}, ov, { [imageId]: url }));
      })
      .catch(e => console.error(e));
  }, [lastEvent]);

  return (
    <div
      className="screen-selector fill-y col align-center"
      style={{ background: "var(--toolbar-color-hex)", borderRight: "var(--border-light)" }}
    >
      <div className="fill-x" style={{ marginTop: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "var(--border-light)" }}>
        <h5 style={{ textAlign: "center" }}>Screens</h5>
      </div>
      <div className="flex-x flex-grow col align-center gap-16" style={{ /*overflowY: "scroll"*/ }}>
        {screenSet?.screens?.map(((screen, ix) => (
          <div className="col align-center" key={screen.id}>
            <div
              className="pointer"
              style={{
                width: 64,
                height: 64,
                border: "var(--border-light)",
                borderColor: ix === activeScreenIndex ? "var(--gradient-stop1)" : undefined,
                backgroundColor: "black"
              }}
              onClick={() => setActiveScreenIndex(ix)}
            >
              {screenImages[screen.id] && (
                <img src={screenImages[screen.id]} alt={screenImages[screen.id]} width={62} height={62} />
              )}
            </div>
            <span
              style={{
                textAlign: "center",
                fontSize: 10,
                color: ix === activeScreenIndex ? "var(--gradient-stop1)" : undefined
              }}
            >
              {screen.name}
            </span>
          </div>
        )))}
      </div>
    </div>
  );
}
