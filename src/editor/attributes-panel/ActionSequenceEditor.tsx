import { ActionSequence, ActionStep, InputKey } from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { MdAdd, MdPlayArrow, MdWarning } from "react-icons/md";
import { PiArrowDown, PiArrowUp, PiX } from "react-icons/pi";

import { Modal } from "../../Modal.tsx";
import { InputKeySelector } from "./InputKeySelector.tsx";

type AudioEntry = { source: string; file: string };

export type ActionSequenceEditorProps = {
  open: boolean;
  onClose: () => void;
  value: ActionSequence;
  onChange: (value: ActionSequence) => void;
  screenSetId: string;
};

type StepType = ActionStep["type"];

function defaultStep(): ActionStep {
  return {
    type: "press",
    key: { type: "joystickButton", button: 1 },
    duration: 100,
  };
}

function getKey(step: ActionStep): InputKey | null {
  if (
    step.type === "press" ||
    step.type === "keyDown" ||
    step.type === "keyUp"
  ) {
    return step.key;
  }
  return null;
}

function setKey(step: ActionStep, key: InputKey): ActionStep {
  switch (step.type) {
    case "press":
      return { ...step, key };
    case "keyDown":
      return { ...step, key };
    case "keyUp":
      return { ...step, key };
    default:
      return step;
  }
}

function changeStepType(step: ActionStep, newType: StepType): ActionStep {
  const key = getKey(step) ?? { type: "joystickButton" as const, button: 1 };
  switch (newType) {
    case "press":
      return { type: "press", key, duration: 100 };
    case "keyDown":
      return { type: "keyDown", key };
    case "keyUp":
      return { type: "keyUp", key };
    case "pause":
      return { type: "pause", duration: 200 };
    case "playSound":
      return { type: "playSound", file: "", source: "sounds", volume: 1.0 };
  }
}

function inputKeysEqual(a: InputKey, b: InputKey): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "joystickButton" && b.type === "joystickButton") {
    return a.button === b.button;
  } else if (a.type !== "joystickButton" && b.type !== "joystickButton") {
    return a.key === b.key;
  }
  return false; // shouldn't get here
}

function validateSequence(sequence: ActionStep[]): boolean {
  const keydowns = sequence.filter(s => s.type === "keyDown");
  const keyups = sequence.filter(s => s.type === "keyUp");
  keyups.forEach(keyup => {
    const keyupKey = keyup.key;
    const keydownIndex = keydowns.findIndex(k => inputKeysEqual(k.key, keyupKey));
    if (keydownIndex > -1) {
      keydowns.splice(keydownIndex, 1);
    }
  });
  return keydowns.length === 0;
}

export function ActionSequenceEditor({
  open,
  onClose,
  value,
  onChange,
  screenSetId,
}: ActionSequenceEditorProps) {
  const [draft, setDraft] = useState<ActionStep[]>(() => [...value.steps]);
  const [audioClips, setAudioClips] = useState<AudioEntry[]>([]);

  const showWarning = useMemo(() => !validateSequence(draft), [draft]);

  useEffect(() => {
    if (open) {
      setDraft([...value.steps]);
      invoke<AudioEntry[]>("get_audio_clips", { screenSetId })
        .then(setAudioClips)
        .catch(() => {});
    }
  }, [open]);

  const updateStep = (index: number, step: ActionStep) => {
    setDraft((prev) => prev.map((s, i) => (i === index ? step : s)));
  };

  const removeStep = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addStep = () => {
    setDraft((prev) => [...prev, defaultStep()]);
  };

  const handleSave = () => {
    onChange({ steps: draft });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      contentStyle={{ width: "unset" }}
      header={<h4 style={{ margin: 0 }}>Edit Action Sequence</h4>}
      footer={
        <div className="row gap-16" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={handleCancel}>
            CANCEL
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            DONE
          </button>
        </div>
      }
    >
      <div className="col gap-16">
        {draft.map((step, index) => (
          <div
            key={index}
            className="row gap-16"
            style={{
              padding: 12,
              border: "1px solid var(--border-color, #444)",
              borderRadius: 6,
            }}
          >
            <div className="row gap-4 align-items-center">
              <span style={{ fontWeight: 600, minWidth: 20 }}>
                {index + 1}.
              </span>
              <select
                value={step.type}
                onChange={(e) =>
                  updateStep(
                    index,
                    changeStepType(step, e.target.value as StepType),
                  )
                }
              >
                <option value="press">Press</option>
                <option value="keyDown">Key Down</option>
                <option value="keyUp">Key Up</option>
                <option value="pause">Pause</option>
                <option value="playSound">Play Sound</option>
              </select>
            </div>
            {(step.type === "press" ||
              step.type === "keyDown" ||
              step.type === "keyUp") && (
              <InputKeySelector
                value={step.key}
                onChange={(key) => updateStep(index, setKey(step, key))}
              />
            )}
            {step.type === "press" && (
              <div className="row gap-4 align-items-center">
                <span>Duration (ms):</span>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  step={10}
                  value={step.duration}
                  onChange={(e) =>
                    updateStep(index, {
                      ...step,
                      duration: Number(e.target.value),
                    })
                  }
                  style={{ width: 80 }}
                />
              </div>
            )}
            {step.type === "pause" && (
              <div className="row gap-4 align-items-center">
                <span>Duration (ms):</span>
                <input
                  type="number"
                  min={10}
                  max={30000}
                  step={10}
                  value={step.duration}
                  onChange={(e) =>
                    updateStep(index, {
                      ...step,
                      duration: Number(e.target.value),
                    })
                  }
                  style={{ width: 80 }}
                />
              </div>
            )}
            {step.type === "playSound" && (
              <div className="row gap-8 align-items-center">
                <select
                  value={`${step.source}:${step.file}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      updateStep(index, {
                        ...step,
                        file: "",
                        source: "sounds",
                      });
                    } else {
                      const [source, file] = val.split(":");
                      updateStep(index, { ...step, file, source });
                    }
                  }}
                >
                  <option value="">Select sound...</option>
                  {audioClips.map((clip) => (
                    <option
                      key={`${clip.source}:${clip.file}`}
                      value={`${clip.source}:${clip.file}`}
                    >
                      {clip.file.replace(/\.(mp3|wav|ogg)$/i, "")}
                    </option>
                  ))}
                </select>
                <span>Vol:</span>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={step.volume}
                  onChange={(e) =>
                    updateStep(index, {
                      ...step,
                      volume: Number(e.target.value),
                    })
                  }
                  style={{ width: 80 }}
                />
                <span style={{ fontSize: 11, opacity: 0.7, minWidth: 32 }}>
                  {Math.round(step.volume * 100)}%
                </span>
                <button
                  className="btn btn-sm"
                  title="Preview sound"
                  disabled={!step.file}
                  onClick={() =>
                    invoke("preview_sound", {
                      screenSetId,
                      source: step.source,
                      file: step.file,
                      volume: step.volume,
                    })
                  }
                >
                  <MdPlayArrow />
                </button>
              </div>
            )}
            <div className="row gap-4" style={{ marginLeft: "auto" }}>
              <button
                className="btn btn-sm"
                disabled={index === 0}
                onClick={() => moveStep(index, -1)}
                title="Move up"
              >
                <PiArrowUp />
              </button>
              <button
                className="btn btn-sm"
                disabled={index === draft.length - 1}
                onClick={() => moveStep(index, 1)}
                title="Move down"
              >
                <PiArrowDown />
              </button>
              <button
                className="btn btn-sm"
                onClick={() => removeStep(index)}
                title="Remove step"
              >
                <PiX />
              </button>
            </div>
          </div>
        ))}
        {draft.length === 0 && (
          <div style={{ opacity: 0.5, textAlign: "center", padding: 16 }}>
            No actions configured. Add a step below.
          </div>
        )}
        <button
          className="btn"
          onClick={addStep}
          style={{ alignSelf: "flex-start" }}
        >
          <div className="row align-items-center gap-8">
            <MdAdd size={12} />
            <span>ADD STEP</span>
          </div>
        </button>
        {showWarning && (
          <div className="row align-items-center gap-8" style={{ color: "#ffaa00" }}>
            <MdWarning size={16} />
            <span><small>Warning: Some "Key Down" events do not have matching "Key Up" events. This will leave the key pressed down until a "Key Up" event from another source is fired.</small></span>
          </div>
        )}
      </div>
    </Modal>
  );
}
