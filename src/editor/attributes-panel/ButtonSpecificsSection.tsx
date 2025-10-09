import {ButtonAction, ButtonAttributes, ButtonType} from "@common/shared/models";
import {MdToggleOff, MdToggleOn} from "react-icons/md";

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
    onUpdate(Object.assign({}, attr, { vjoyButton: { ...attr.vjoyButton, [key]: value }}), "widget.button.button");
  };

  const handleNavTargetChange = (targetId: string) => {
    onUpdate(Object.assign({}, attr, { navTarget: targetId }), "widget.button.navTarget");
  };

  const Toggle = isPressed ? MdToggleOn : MdToggleOff;

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
            <div className="row gap-16">
              <span>Duration (ms):</span>
              <input
                type="number"
                min={50}
                max={5000}
                step={10}
                value={attr.vjoyButton.duration}
                onChange={(evt) => handleVjoyButtonChange("duration", Number.parseInt(evt.target.value))}
              />
            </div>
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
        <div className="row align-center gap-16">
          <span>State:</span>
          <Toggle size={32} color={isPressed ? "#6dc76d" : undefined} onClick={togglePressed} className="pointer" />
          ({isPressed ? "pressed" : "default"})
        </div>
      </div>
    </div>
  );
}
