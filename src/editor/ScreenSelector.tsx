import {useEffect} from "react";
import useTauriListen from "../hooks/useTauriListen.tsx";
import {useECStore} from "../store";

export function ScreenSelector() {
  const screenSet = useECStore(state => state.screenSet)
  const { lastEvent, unListen } = useTauriListen<string>("screen-image-updated");
  useEffect(() => {
    return () => {
      unListen.then(r => r());
    };
  }, []);

  useEffect(() => {
    console.log(lastEvent);
  }, [lastEvent]);

  return (
    <div
      className="screen-selector fill-y col align-center"
      style={{ background: "var(--toolbar-color-hex)", borderRight: "var(--border-light)" }}
    >
      <div className="fill-x" style={{ marginTop: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "var(--border-light)" }}>
        <h5 style={{ textAlign: "center" }}>Screens</h5>
      </div>
      <div className="gap-16" style={{ overflowY: "scroll" }}>
        {screenSet?.screens?.map(screen => (
          <div key={screen.id} style={{ width: 64, height: 64, border: "var(--border-light)" }}>
          </div>
        ))}
      </div>
    </div>
  );
}
