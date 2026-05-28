import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { Modal } from "../Modal.tsx";

type SettingsResponse = {
  port: number;
  journalPath: string | null;
  vjoyDeviceId: number;
  platform: string;
};

type Settings = {
  port: number;
  journalPath: string | null;
  vjoyDeviceId: number;
};

export type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [platform, setPlatform] = useState("");
  const [port, setPort] = useState("");
  const [journalPath, setJournalPath] = useState("");
  const [vjoyDeviceId, setVjoyDeviceId] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      invoke<SettingsResponse>("get_settings").then((s) => {
        setPlatform(s.platform);
        setPort(String(s.port));
        setJournalPath(s.journalPath ?? "");
        setVjoyDeviceId(String(s.vjoyDeviceId));
        setDirty(false);
        setSaved(false);
        setError("");
        setLoaded(true);
      });
    }
  }, [open]);

  const handleSave = async () => {
    setError("");
    const updated: Settings = {
      port: parseInt(port) || 11011,
      journalPath: journalPath.trim() || null,
      vjoyDeviceId: parseInt(vjoyDeviceId) || 2,
    };
    try {
      await invoke("save_settings", { settings: updated });
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setError(String(e));
    }
  };

  const handleBrowseJournal = async () => {
    try {
      const path = await invoke<string | null>("get_default_journal_path");
      if (path) {
        setJournalPath(path);
        setDirty(true);
      }
    } catch (_) {}
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      header={<h4 style={{ margin: 0 }}>Settings</h4>}
      contentStyle={{ width: "400px" }}
      footer={
        <div className="row gap-12 align-items-center" style={{ justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, opacity: 0.5 }}>
            {saved && "Restart required for changes to take effect."}
            {error && <span style={{ color: "#ff4444" }}>{error}</span>}
          </span>
          <div className="row gap-12">
            <button onClick={onClose}>CLOSE</button>
            <button onClick={handleSave} disabled={!dirty}>
              SAVE
            </button>
          </div>
        </div>
      }
    >
      {loaded && (
        <div className="col gap-16">
          <label className="col gap-4">
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              Mobile Client Port
            </span>
            <input
              type="number"
              min={1024}
              max={65535}
              value={port}
              onChange={(e) => {
                setPort(e.target.value);
                setDirty(true);
              }}
            />
          </label>

          <label className="col gap-4">
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              Elite Dangerous Journal Path
            </span>
            <div className="row gap-8">
              <input
                style={{ flex: 1 }}
                value={journalPath}
                placeholder="Auto-detect"
                onChange={(e) => {
                  setJournalPath(e.target.value);
                  setDirty(true);
                }}
              />
              <button onClick={handleBrowseJournal} style={{ whiteSpace: "nowrap" }}>
                Detect
              </button>
            </div>
            <span style={{ fontSize: 10, opacity: 0.4 }}>
              Leave blank to auto-detect on startup.
            </span>
          </label>

          {platform === "windows" && (
            <label className="col gap-4">
              <span style={{ fontSize: 12, opacity: 0.6 }}>
                VJoy Device ID
              </span>
              <input
                type="number"
                min={1}
                max={16}
                value={vjoyDeviceId}
                onChange={(e) => {
                  setVjoyDeviceId(e.target.value);
                  setDirty(true);
                }}
              />
            </label>
          )}
        </div>
      )}
    </Modal>
  );
}
