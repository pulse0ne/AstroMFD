import {
  ActionSequence,
  ButtonAttributes,
  ButtonType,
} from "@common/shared/models";
import { useState } from "react";

import { useECStore } from "../../store";
import { ActionSequenceEditor } from "./ActionSequenceEditor.tsx";
import { Toggle } from "./Toggle.tsx";

export type ScreenIdAndName = {
  id: string;
  name: string;
};

export type ButtonSpecificsSectionProps = {
  attr: ButtonAttributes;
  screens: ScreenIdAndName[];
  isPressed: boolean;
  togglePressed: () => void;
  onUpdate: (attr: ButtonAttributes, type: string) => void;
};

function summarizeSteps(input: ActionSequence): string {
  const count = input.steps.length;
  if (count === 0) return "No actions configured";
  if (count === 1) {
    const step = input.steps[0];
    if (step.type === "press") {
      const k = step.key;
      const label =
        k.type === "joystickButton"
          ? `Button ${k.button}`
          : k.type === "letter"
            ? `Key ${k.key}`
            : k.type === "number"
              ? `Key ${k.key}`
              : k.type === "functionKey"
                ? `F${k.key}`
                : k.key;
      return `Press ${label} (${step.duration}ms)`;
    }
    return `1 step`;
  }
  return `${count} steps`;
}

export function ButtonSpecificsSection({
  attr,
  screens,
  isPressed,
  togglePressed,
  onUpdate,
}: ButtonSpecificsSectionProps) {
  const screenSetId = useECStore((state) => state.screenSet?.id ?? "");
  const [editorOpen, setEditorOpen] = useState(false);

  const handleButtonTypeChange = (value: ButtonType) => {
    onUpdate(
      Object.assign({}, attr, { buttonType: value }),
      "widget.button.type",
    );
  };

  const handleNavTargetChange = (targetId: string) => {
    onUpdate(
      Object.assign({}, attr, { navTarget: targetId }),
      "widget.button.navTarget",
    );
  };

  const handleActionsChange = (input: ActionSequence) => {
    onUpdate(Object.assign({}, attr, { input }), "widget.button.input");
  };

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>ATTRIBUTES</h5>
      <div className="row gap-16">
        <span>Type:</span>
        <select
          value={attr.buttonType}
          onChange={(evt) =>
            handleButtonTypeChange(evt.target.value as ButtonType)
          }
        >
          <option value="action">Action</option>
          <option value="navigation">Navigation</option>
          <option value="toggle">Toggle</option>
        </select>
      </div>
      <div className="col gap-16">
        {(attr.buttonType === "action" || attr.buttonType === "toggle") && (
          <div className="col gap-8">
            <div className="row gap-16 align-items-center">
              <span>Actions:</span>
              <span style={{ opacity: 0.7, fontSize: 12 }}>
                {summarizeSteps(attr.input)}
              </span>
            </div>
            <button className="btn btn-sm" onClick={() => setEditorOpen(true)}>
              EDIT ACTIONS
            </button>
          </div>
        )}
        {attr.buttonType === "navigation" && (
          <div className="row gap-16">
            <span>Target Screen:</span>
            <select
              value={attr.navTarget ?? ""}
              onChange={(evt) => handleNavTargetChange(evt.target.value)}
            >
              {screens.length ? (
                <option value=""></option>
              ) : (
                <option value="" disabled={true}>
                  &lt;No targets&gt;
                </option>
              )}
              {screens.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="col gap-16">
        <div className="row align-items-center gap-16">
          <span>State:</span>
          <Toggle
            size={32}
            value={isPressed}
            onToggle={togglePressed}
            leftLabel="Default"
            rightLabel="Pressed"
          />
        </div>
      </div>
      <ActionSequenceEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        value={attr.input}
        onChange={handleActionsChange}
        screenSetId={screenSetId}
      />
    </div>
  );
}
