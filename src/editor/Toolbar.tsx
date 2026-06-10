import { Widget } from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import {
  PropsWithChildren,
  useMemo,
  useState,
  type MutableRefObject,
} from "react";
import { MdAdd, MdArrowBackIos, MdError, MdWarning } from "react-icons/md";
import { useNavigate } from "react-router";
import Popup from "reactjs-popup";

import { useAvailableInputKeys } from "../hooks/useAvailableInputKeys.tsx";
import { useECStore } from "../store";
import {
  activeScreenSelector,
  activeScreenWidgetsSelector,
  hasRedosSelector,
  hasUndosSelector,
} from "../store/selectors.ts";
import { createButton } from "../utils/createButton.ts";
import { createCarousel } from "../utils/createCarousel.ts";
import { createImage } from "../utils/createImage.ts";
import { createLabel } from "../utils/createLabel.ts";
import { createPanel } from "../utils/createPanel.ts";
import { createScreen } from "../utils/createScreen.ts";
import { createSlider } from "../utils/createSlider.ts";
import { findNextAvailableButton } from "../utils/findNextAvailableButton.ts";
import {
  validateScreenSet,
  type ValidationIssue,
} from "../utils/validateScreenSet.ts";

import "./toolbar.css";

import { ScreenSet } from "@common/shared/models";
import { IconType } from "react-icons";
import { PiArrowUUpLeft, PiArrowUUpRight } from "react-icons/pi";

import { EditableTitle } from "./EditableTitle.tsx";

export function Toolbar({ dirtyRef }: { dirtyRef: MutableRefObject<boolean> }) {
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const screenSet = useECStore((state) => state.screenSet);
  const selectedScreen = useECStore(activeScreenSelector);
  const addScreen = useECStore((state) => state.addScreen);
  const updateScreen = useECStore((state) => state.updateScreen);
  const addWidget = useECStore((state) => state.addWidget);
  const widgets = useECStore(activeScreenWidgetsSelector);
  const hasUndos = useECStore(hasUndosSelector);
  const hasRedos = useECStore(hasRedosSelector);
  const undo = useECStore((state) => state.undo);
  const redo = useECStore((state) => state.redo);
  const navigate = useNavigate();
  const { defaultKey } = useAvailableInputKeys();

  const handleScreenRename = (name: string) => {
    if (selectedScreen) {
      updateScreen(Object.assign({}, selectedScreen, { name }));
    }
  };

  const handleAddScreen = () => {
    setAddPopupOpen(false);
    if (screenSet?.screens?.length) {
      addScreen(createScreen(screenSet.screens.length + 1));
    }
  };

  const handleAddWidget = (createWidgetFn: () => Widget) => {
    setAddPopupOpen(false);
    const newWidget = createWidgetFn();
    if (newWidget.type === "button") {
      if (defaultKey.type === "joystickButton") {
        const nextButton = findNextAvailableButton(widgets ?? []);
        newWidget.input = {
          steps: [
            {
              type: "press",
              key: { type: "joystickButton", button: nextButton },
              duration: 100,
            },
          ],
        };
      }
    }
    addWidget(newWidget);
  };

  const handleAddImage = async () => {
    setAddPopupOpen(false);
    if (!screenSet) return;
    try {
      const filename = await invoke<string>("import_image", { screenSetId: screenSet.id, path: null });
      addWidget(createImage(filename));
    } catch (_) {
      // user cancelled
    }
  };

  const goBack = () => {
    if (dirtyRef.current) {
      if (!window.confirm("You have unsaved changes. Leave anyway?")) return;
    }
    navigate("/");
  };

  return (
    <div className="toolbar row align-items-center justify-content-space-between relative">
      <div className="row align-items-center">
        <MdArrowBackIos className="pointer m16-r" onClick={goBack} />
        <Popup
          open={addPopupOpen}
          closeOnDocumentClick
          onOpen={() => setAddPopupOpen(true)}
          onClose={() => setAddPopupOpen(false)}
          arrow={false}
          contentStyle={{ background: "var(--toolbar-color-hex)", width: 128 }}
          position="bottom left"
          trigger={
            <button className="p16-l">
              <div className="row align-items-center gap-4">
                <MdAdd size={12} />
                <span>ADD</span>
              </div>
            </button>
          }
        >
          <AddWidgetMenuItem
            onClick={() => handleAddWidget(() => createButton(defaultKey))}
          >
            Button
          </AddWidgetMenuItem>
          <AddWidgetMenuItem onClick={() => handleAddWidget(createLabel)}>
            Label
          </AddWidgetMenuItem>
          <AddWidgetMenuItem onClick={() => handleAddWidget(createSlider)}>
            Slider
          </AddWidgetMenuItem>
          <AddWidgetMenuItem onClick={() => handleAddWidget(createPanel)}>
            Panel
          </AddWidgetMenuItem>
          <AddWidgetMenuItem onClick={() => handleAddWidget(createCarousel)}>
            Carousel
          </AddWidgetMenuItem>
          <AddWidgetMenuItem onClick={handleAddImage}>
            Image
          </AddWidgetMenuItem>
          <div style={{ borderBottom: "var(--border-light)" }}></div>
          <AddWidgetMenuItem onClick={handleAddScreen}>
            Screen
          </AddWidgetMenuItem>
        </Popup>
      </div>
      <div className="fill-y row align-items-center gap-4 toolbar-centered-container">
        <EditableTitle
          value={selectedScreen?.name ?? ""}
          onChange={handleScreenRename}
          style={{ fontSize: 16, fontWeight: "bold" }}
          inputStyle={{ fontSize: 16, fontWeight: "bold" }}
          editIcon
          iconSize={12}
        />
      </div>
      <div className="row align-items-center gap-16">
        {screenSet && <ValidationIndicator screenSet={screenSet} />}
        <UndoRedoButton type="undo" disabled={!hasUndos} onClick={undo} />
        <UndoRedoButton type="redo" disabled={!hasRedos} onClick={redo} />
      </div>
    </div>
  );
}

type AddWidgetMenuItemProps = PropsWithChildren<{
  onClick: () => void;
}>;

function AddWidgetMenuItem({ onClick, children }: AddWidgetMenuItemProps) {
  return (
    <div className="popup-menu-item" onClick={onClick}>
      {children}
    </div>
  );
}

type UndoRedoButtonProps = {
  type: "undo" | "redo";
  onClick: () => void;
  disabled: boolean;
};

function UndoRedoButton({ type, onClick, disabled }: UndoRedoButtonProps) {
  const Icon: IconType = type === "undo" ? PiArrowUUpLeft : PiArrowUUpRight;

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <Icon
      size={20}
      onClick={handleClick}
      title={type === "undo" ? "Undo" : "Redo"}
      style={{
        cursor: disabled ? undefined : "pointer",
        color: disabled ? "#666" : "var(--gradient-stop1)",
      }}
    />
  );
}

function ValidationIndicator({ screenSet }: { screenSet: ScreenSet }) {
  const result = useMemo(() => validateScreenSet(screenSet), [screenSet]);

  const errors = result.issues.filter((i) => i.level === "error");
  const warnings = result.issues.filter((i) => i.level === "warning");

  if (result.issues.length === 0) return null;

  return (
    <Popup
      trigger={
        <div
          className="row align-items-center gap-4 pointer"
          style={{ fontSize: 11 }}
        >
          {errors.length > 0 && (
            <span
              className="row align-items-center gap-4"
              style={{ color: "#ff4444" }}
            >
              <MdError size={14} /> {errors.length}
            </span>
          )}
          {warnings.length > 0 && (
            <span
              className="row align-items-center gap-4"
              style={{ color: "#ffaa00" }}
            >
              <MdWarning size={14} /> {warnings.length}
            </span>
          )}
        </div>
      }
      position="bottom right"
      arrow={false}
      closeOnDocumentClick
      contentStyle={{
        background: "var(--panel-color-hex)",
        border: "var(--border-light)",
        borderRadius: 6,
        maxHeight: 300,
        overflowY: "auto",
        width: 320,
        padding: 0,
      }}
    >
      <div className="col" style={{ fontSize: 12 }}>
        {result.issues.map((issue, i) => (
          <ValidationIssueRow key={i} issue={issue} />
        ))}
      </div>
    </Popup>
  );
}

function ValidationIssueRow({ issue }: { issue: ValidationIssue }) {
  const color = issue.level === "error" ? "#ff4444" : "#ffaa00";
  const Icon = issue.level === "error" ? MdError : MdWarning;
  return (
    <div
      className="row align-items-center gap-8"
      style={{
        padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Icon size={13} color={color} style={{ flexShrink: 0 }} />
      <div className="col" style={{ minWidth: 0 }}>
        <span style={{ opacity: 0.5 }}>{issue.screen}</span>
        <span>{issue.message}</span>
      </div>
    </div>
  );
}
