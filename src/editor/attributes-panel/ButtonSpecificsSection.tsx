import {ButtonAction, ButtonAttributes, ButtonType} from "@common/shared/models";
import {Toggle} from "./Toggle.tsx";

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

export function ButtonSpecificsSection({ attr, screens, isPressed, togglePressed, onUpdate }: ButtonSpecificsSectionProps) {

  const handleButtonTypeChange = (value: ButtonType) => {
    onUpdate(Object.assign({}, attr, { buttonType: value }), "widget.button.type");
  };

  const handleVjoyButtonChange = (key: keyof ButtonAction, value: number) => {
    onUpdate(Object.assign({}, attr, { vjoyButton: { ...attr.vjoyButton, [key]: value }}), `widget.button.button.${key}`);
  };

  const toggleFixedDuration = () => {
    const fixedDuration = !attr.vjoyButton.fixedDuration;
    onUpdate(Object.assign({}, attr, { vjoyButton: { ...attr.vjoyButton, fixedDuration }}), "widget.button.button.fixedDuration");
  };

  const handleNavTargetChange = (targetId: string) => {
    onUpdate(Object.assign({}, attr, { navTarget: targetId }), "widget.button.navTarget");
  };

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>BUTTON</h5>
      <div className="row gap-16">
        <span>Type:</span>
        <select
          value={attr.buttonType}
          onChange={evt => handleButtonTypeChange(evt.target.value as ButtonType)}
        >
          <option value="action">Action</option>
          <option value="navigation">Navigation</option>
          <option value="toggle">Toggle</option>
        </select>
      </div>
      <div className="col gap-16">
        {(attr.buttonType === "action" || attr.buttonType === "toggle") && (
          <>
            <div className="row gap-16">
              <span>Button:</span>
              <input
                type="number"
                min={1}
                max={127}
                step={1}
                value={attr.vjoyButton.button}
                onChange={(evt) => handleVjoyButtonChange("button", Number.parseInt(evt.target.value))}
              />
            </div>
            <div className="row gap-16 align-items-center">
              <span>Fixed Duration:</span>
              <Toggle onToggle={toggleFixedDuration} value={attr.vjoyButton.fixedDuration} />
            </div>
            {attr.vjoyButton.fixedDuration && (
              <div className="row gap-16 align-items-center">
                <span>Duration (ms):</span>
                <input
                  type="number"
                  min={50}
                  max={5000}
                  step={10}
                  disabled={!attr.vjoyButton.fixedDuration}
                  value={attr.vjoyButton.duration}
                  onChange={(evt) => handleVjoyButtonChange("duration", Number.parseInt(evt.target.value))}
                />
              </div>
            )}
          </>
        )}
        {attr.buttonType === "navigation" && (
          <div className="row gap-16">
            <span>Target Screen:</span>
            <select value={attr.navTarget ?? ""} onChange={(evt) => handleNavTargetChange(evt.target.value)}>
              {screens.length ? (<option value=""></option>) : (<option value="" disabled={true}>&lt;No targets&gt;</option>)}
              {screens.map(({ id, name }) => (
                <option key={id} value={id}>{name}</option>
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
    </div>
  );
}
