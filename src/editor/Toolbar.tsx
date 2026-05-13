import { Widget } from "@common/shared/models";
import { PropsWithChildren, useState } from "react";
import { MdAdd, MdArrowBackIos, MdRedo, MdUndo } from "react-icons/md";
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
import { createLabel } from "../utils/createLabel.ts";
import { createPanel } from "../utils/createPanel.ts";
import { createScreen } from "../utils/createScreen.ts";
import { findNextAvailableButton } from "../utils/findNextAvailableButton.ts";

import "./toolbar.css";

import { IconType } from "react-icons";

import { EditableTitle } from "./EditableTitle.tsx";

export function Toolbar() {
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
      // If the default key is a joystick button, find the next available one
      if (defaultKey.type === "joystickButton") {
        const nextButton = findNextAvailableButton(widgets ?? []);
        newWidget.input.key = { type: "joystickButton", button: nextButton };
      }
      // Otherwise, use the default key as-is
    }
    addWidget(newWidget);
  };

  const goBack = () => {
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
          contentStyle={{ background: "var(--toolbar-color-hex)" }}
          trigger={
            <button className="p16-l">
              <div className="row align-items-center gap-4">
                <MdAdd size={15} />
                <span>Add</span>
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
          <AddWidgetMenuItem onClick={() => handleAddWidget(createPanel)}>
            Panel
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
  const Icon: IconType = type === "undo" ? MdUndo : MdRedo;

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <Icon
      size={20}
      onClick={handleClick}
      style={{
        cursor: disabled ? undefined : "pointer",
        color: disabled ? "#666" : "var(--gradient-stop1)",
      }}
    />
  );
}
