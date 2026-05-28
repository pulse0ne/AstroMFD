import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdAdd } from "react-icons/md";
import { PiGearSix } from "react-icons/pi";
import { useNavigate } from "react-router";

import "./screen-set-selector.css";

import {
  PiCopySimple,
  PiCursorText,
  PiDownloadSimple,
  PiExport,
  PiPencilSimple,
  PiTrashSimple,
} from "react-icons/pi";

import { Modal } from "../Modal.tsx";
import { SettingsModal } from "./SettingsModal.tsx";

type ScreenSetMeta = {
  id: string;
  name: string;
  screenImgId: string | null;
  modifiedAt: number;
};

type ContextMenuState = {
  x: number;
  y: number;
  screenSet: ScreenSetMeta;
} | null;

function relativeTime(epochSecs: number): string {
  if (!epochSecs) return "";
  const now = Date.now() / 1000;
  const diff = now - epochSecs;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(epochSecs * 1000).toLocaleDateString();
}

export function ScreenSetSelector() {
  const [screenSets, setScreenSets] = useState<ScreenSetMeta[]>([]);
  const [screenImages, setScreenImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [confirmDelete, setConfirmDelete] = useState<ScreenSetMeta | null>(
    null,
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const nav = useNavigate();

  const refresh = useCallback(() => {
    invoke<ScreenSetMeta[]>("list_screen_sets")
      .then(setScreenSets)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    screenSets
      .filter((ss) => Boolean(ss.screenImgId))
      .forEach((ss) => {
        if (screenImages[ss.id]) return;
        invoke<ArrayBuffer>("get_screen_img", { id: ss.screenImgId }).then(
          (buf) => {
            const blob = new Blob([buf], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            setScreenImages((prev) => ({ ...prev, [ss.id]: url }));
          },
        );
      });
  }, [screenSets]);

  const handleContextMenu = (e: React.MouseEvent, ss: ScreenSetMeta) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, screenSet: ss });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    if (contextMenu) {
      const handler = () => closeContextMenu();
      document.addEventListener("click", handler);
      document.addEventListener("contextmenu", handler);
      return () => {
        document.removeEventListener("click", handler);
        document.removeEventListener("contextmenu", handler);
      };
    }
  }, [contextMenu]);

  const handleRename = (ss: ScreenSetMeta) => {
    closeContextMenu();
    const name = prompt("Rename screen set:", ss.name);
    if (name && name !== ss.name) {
      invoke<ScreenSetMeta[]>("rename_screen_set", { id: ss.id, name }).then(
        setScreenSets,
      );
    }
  };

  const handleDuplicate = (ss: ScreenSetMeta) => {
    closeContextMenu();
    invoke<ScreenSetMeta[]>("duplicate_screen_set", { id: ss.id }).then(
      setScreenSets,
    );
  };

  const handleExport = (ss: ScreenSetMeta) => {
    closeContextMenu();
    invoke("export_screen_set", { id: ss.id, name: ss.name });
  };

  const handleImport = () => {
    invoke<string | null>("import_screen_set").then((id) => {
      if (id) refresh();
    });
  };

  const handleDeleteConfirm = () => {
    if (!confirmDelete) return;
    invoke<ScreenSetMeta[]>("delete_screen_set", { id: confirmDelete.id })
      .then(setScreenSets)
      .finally(() => setConfirmDelete(null));
  };

  const handleCreate = (name: string) => {
    invoke<{ id: string }>("create_screen_set", { name }).then((ss) =>
      nav(`/creator/${ss.id}`),
    );
  };

  const filtered = search
    ? screenSets.filter((ss) =>
        ss.name.toLowerCase().includes(search.toLowerCase()),
      )
    : screenSets;

  return (
    <div className="screen-set-selector">
      <div className="screen-set-selector-header">
        <h1>Screen Sets</h1>
        <div className="row gap-12 align-items-center">
          {screenSets.length > 4 && (
            <input
              className="screen-set-search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <PiDownloadSimple
            size={20}
            className="pointer"
            onClick={handleImport}
            title="Import Screen Set"
            style={{ opacity: 0.7 }}
          />
          <PiGearSix
            size={20}
            className="pointer"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            style={{ opacity: 0.7 }}
          />
        </div>
      </div>

      <div className="scroll-y flex-grow">
        {loading ? (
          <div className="row justify-content-center p24">
            <div className="loader" />
          </div>
        ) : screenSets.length === 0 ? (
          <div className="screen-set-empty">
            <h2>No screen sets yet</h2>
            <p>Create your first screen set to get started.</p>
            <button onClick={() => setCreateModalOpen(true)}>
              <div className="row align-items-center gap-8">
                <MdAdd size={12} />
                <span>CREATE SCREEN SET</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="screen-set-grid">
            {filtered.map((ss) => (
              <div
                key={ss.id}
                className="screen-set-card"
                onClick={() => nav(`/creator/${ss.id}`)}
                onContextMenu={(e) => handleContextMenu(e, ss)}
              >
                <div className="screen-set-card-thumb">
                  {screenImages[ss.id] && (
                    <img src={screenImages[ss.id]} alt={ss.name} />
                  )}
                </div>
                <div className="screen-set-card-body">
                  <div className="screen-set-card-name">{ss.name}</div>
                  <div className="screen-set-card-meta">
                    {relativeTime(ss.modifiedAt)}
                  </div>
                </div>
              </div>
            ))}
            <div
              className="screen-set-add-card"
              onClick={() => setCreateModalOpen(true)}
            >
              <MdAdd size={36} style={{ opacity: 0.4 }} />
              <span>New Screen Set</span>
            </div>
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              nav(`/creator/${contextMenu.screenSet.id}`);
              closeContextMenu();
            }}
          >
            <PiPencilSimple size={14} /> Edit
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleRename(contextMenu.screenSet)}
          >
            <PiCursorText /> Rename
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleDuplicate(contextMenu.screenSet)}
          >
            <PiCopySimple size={14} /> Duplicate
          </div>
          <div
            className="context-menu-item"
            onClick={() => handleExport(contextMenu.screenSet)}
          >
            <PiExport size={14} /> Export
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item danger"
            onClick={() => {
              setConfirmDelete(contextMenu.screenSet);
              closeContextMenu();
            }}
          >
            <PiTrashSimple size={14} /> Delete
          </div>
        </div>
      )}

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        header={<h4 style={{ margin: 0 }}>Delete Screen Set</h4>}
        footer={
          <div className="row gap-12" style={{ justifyContent: "flex-end" }}>
            <button onClick={() => setConfirmDelete(null)}>CANCEL</button>
            <button
              onClick={handleDeleteConfirm}
              style={{ borderColor: "#ff4444", color: "#ff4444" }}
            >
              DELETE
            </button>
          </div>
        }
      >
        <p>
          Permanently delete <strong>{confirmDelete?.name}</strong>? This cannot
          be undone.
        </p>
      </Modal>

      <CreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={handleCreate}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
};

function CreateModal({ open, onClose, onConfirm }: CreateModalProps) {
  const [name, setName] = useState("Untitled Screen Set");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("Untitled Screen Set");
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      header={<h4 style={{ margin: 0 }}>New Screen Set</h4>}
      footer={
        <div className="row gap-12" style={{ justifyContent: "flex-end" }}>
          <button onClick={onClose}>CANCEL</button>
          <button onClick={handleSubmit} disabled={!name.trim()}>
            CREATE
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <label className="col gap-8">
          <span style={{ fontSize: 12, opacity: 0.6 }}>Name</span>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
      </form>
    </Modal>
  );
}
