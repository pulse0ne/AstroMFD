import {useEffect} from "react";
import useTauriListen from "../hooks/useTauriListen.tsx";

export function ScreenSelector() {
  const { lastEvent, unListen } = useTauriListen<string>("screen-image-updated");
  useEffect(() => {
    return () => {
      unListen();
    };
  }, []);

  useEffect(() => {
    console.log(lastEvent);
  }, [lastEvent]);

  return (
    <div className="screen-selector fill-y" style={{ background: "var(--toolbar-color-hex)", borderRight: "var(--border-light)" }}>
      TODO: Screens
    </div>
  );
}
