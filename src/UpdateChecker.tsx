import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useEffect, useState } from "react";

import { Modal } from "./Modal.tsx";

type UpdateState =
  | { status: "idle" }
  | { status: "available"; version: string; body: string }
  | { status: "downloading"; progress: number }
  | { status: "ready" }
  | { status: "error"; message: string };

export function UpdateChecker() {
  const [state, setState] = useState<UpdateState>({ status: "idle" });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    check()
      .then((update) => {
        if (update) {
          setState({
            status: "available",
            version: update.version,
            body: update.body ?? "",
          });
        }
      })
      .catch((e) => {
        console.warn("Update check failed:", e);
      });
  }, []);

  const handleInstall = async () => {
    setState({ status: "downloading", progress: 0 });
    try {
      const update = await check();
      if (!update) return;

      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setState({
                status: "downloading",
                progress: Math.round((downloaded / contentLength) * 100),
              });
            }
            break;
          case "Finished":
            setState({ status: "ready" });
            break;
        }
      });

      setState({ status: "ready" });
    } catch (e) {
      setState({ status: "error", message: String(e) });
    }
  };

  const handleRelaunch = async () => {
    await relaunch();
  };

  if (state.status === "idle" || dismissed) return null;

  return (
    <Modal
      open={true}
      onClose={() => {
        if (state.status === "available") setDismissed(true);
      }}
      header={<h4 style={{ margin: 0 }}>Update Available</h4>}
      contentStyle={{ width: "420px" }}
      footer={
        <div className="row gap-12" style={{ justifyContent: "flex-end" }}>
          {state.status === "available" && (
            <>
              <button onClick={() => setDismissed(true)}>LATER</button>
              <button onClick={handleInstall}>INSTALL</button>
            </>
          )}
          {state.status === "downloading" && (
            <button disabled>INSTALLING...</button>
          )}
          {state.status === "ready" && (
            <button onClick={handleRelaunch}>RESTART NOW</button>
          )}
          {state.status === "error" && (
            <button onClick={() => setDismissed(true)}>CLOSE</button>
          )}
        </div>
      }
    >
      {state.status === "available" && (
        <div className="col gap-8">
          <p style={{ margin: 0 }}>
            Version <strong>{state.version}</strong> is available.
          </p>
          {state.body && (
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                whiteSpace: "pre-wrap",
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {state.body}
            </div>
          )}
        </div>
      )}
      {state.status === "downloading" && (
        <div className="col gap-8">
          <p style={{ margin: 0 }}>Downloading update...</p>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${state.progress}%`,
                background: "var(--gradient-stop1)",
                transition: "width 0.2s",
              }}
            />
          </div>
          <span style={{ fontSize: 11, opacity: 0.5 }}>
            {state.progress}%
          </span>
        </div>
      )}
      {state.status === "ready" && (
        <p style={{ margin: 0 }}>
          Update installed. Restart to apply.
        </p>
      )}
      {state.status === "error" && (
        <p style={{ margin: 0, color: "#ff4444" }}>{state.message}</p>
      )}
    </Modal>
  );
}
