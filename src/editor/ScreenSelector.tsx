import { Screen } from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { PiCopySimple, PiCursorText, PiTrashSimple } from "react-icons/pi";

import useTauriListen from "../hooks/useTauriListen.tsx";
import { Modal } from "../Modal.tsx";
import { useECStore } from "../store";
import { duplicateScreen } from "../utils/duplicateScreen.ts";
import { EditableTitle } from "./EditableTitle.tsx";

import "./screen-selector.css";

type ImageUpdatedMessage = {
  id: string;
};

type ContextMenuState = {
  x: number;
  y: number;
  screenIndex: number;
} | null;

export function ScreenSelector() {
  const screenSet = useECStore((state) => state.screenSet);
  const activeScreenIndex = useECStore((state) => state.activeScreenIndex);
  const setActiveScreenIndex = useECStore(
    (state) => state.setActiveScreenIndex,
  );
  const updateScreen = useECStore((state) => state.updateScreen);
  const deleteScreen = useECStore((state) => state.deleteScreen);
  const addScreen = useECStore((state) => state.addScreen);
  const [screenImages, setScreenImages] = useState<Record<string, string>>({});
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [renaming, setRenaming] = useState<{
    index: number;
    name: string;
  } | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (contextMenu) {
      const handler = () => setContextMenu(null);
      document.addEventListener("click", handler);
      document.addEventListener("contextmenu", handler);
      return () => {
        document.removeEventListener("click", handler);
        document.removeEventListener("contextmenu", handler);
      };
    }
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, screenIndex: index });
  };

  const handleScreenRename = (name: string) => {
    if (!screenSet || activeScreenIndex === null) return;
    const updatedScreen: Screen = Object.assign(
      {},
      screenSet.screens[activeScreenIndex],
      { name },
    );
    updateScreen(updatedScreen);
  };

  const handleRename = () => {
    if (!screenSet || contextMenu === null) return;
    const screen = screenSet.screens[contextMenu.screenIndex];
    setRenaming({ index: contextMenu.screenIndex, name: screen.name });
    setContextMenu(null);
  };

  const handleRenameConfirm = () => {
    if (!screenSet || !renaming || !renaming.name.trim()) return;
    const screen = screenSet.screens[renaming.index];
    if (renaming.name !== screen.name) {
      setActiveScreenIndex(renaming.index);
      updateScreen(Object.assign({}, screen, { name: renaming.name.trim() }));
    }
    setRenaming(null);
  };

  useEffect(() => {
    if (renaming) {
      setTimeout(() => renameInputRef.current?.select(), 50);
    }
  }, [renaming]);

  const handleDuplicate = () => {
    if (!screenSet || contextMenu === null) return;
    const screen = screenSet.screens[contextMenu.screenIndex];
    setContextMenu(null);
    const copy = duplicateScreen(screen);
    copy.name = `${screen.name} (copy)`;
    addScreen(copy);
  };

  const handleDelete = () => {
    if (!screenSet || contextMenu === null) return;
    const screen = screenSet.screens[contextMenu.screenIndex];
    setContextMenu(null);
    if (screenSet.screens.length <= 1) return;
    deleteScreen(screen.id);
  };

  return (
    <div className="screen-selector fill-y col align-items-center">
      <div className="fill-x m16-t m16-b border-b">
        <h5 className="text-center">Screens</h5>
      </div>
      <div className="fill-x flex-grow col align-items-center gap-16">
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
              onContextMenu={(e) => handleContextMenu(e, ix)}
            >
              {screenImages[screen.id] && (
                <img
                  src={screenImages[screen.id]}
                  alt={screenImages[screen.id]}
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
              inputStyle={{ fontSize: 10, textAlign: "center", maxWidth: 92 }}
              value={screen.name}
              onChange={handleScreenRename}
            />
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="context-menu-item" onClick={handleRename}>
            <PiCursorText size={14} /> Rename
          </div>
          <div className="context-menu-item" onClick={handleDuplicate}>
            <PiCopySimple size={14} /> Duplicate
          </div>
          {screenSet && screenSet.screens.length > 1 && (
            <>
              <div className="context-menu-separator" />
              <div className="context-menu-item danger" onClick={handleDelete}>
                <PiTrashSimple size={14} /> Delete
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        open={!!renaming}
        onClose={() => setRenaming(null)}
        header={<h4 style={{ margin: 0 }}>Rename Screen</h4>}
        footer={
          <div className="row gap-12" style={{ justifyContent: "flex-end" }}>
            <button onClick={() => setRenaming(null)}>CANCEL</button>
            <button
              onClick={handleRenameConfirm}
              disabled={!renaming?.name.trim()}
            >
              RENAME
            </button>
          </div>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRenameConfirm();
          }}
        >
          <label className="col gap-8">
            <span style={{ fontSize: 12, opacity: 0.6 }}>Name</span>
            <input
              ref={renameInputRef}
              value={renaming?.name ?? ""}
              onChange={(e) =>
                setRenaming((r) => (r ? { ...r, name: e.target.value } : null))
              }
              style={{ width: "100%" }}
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
