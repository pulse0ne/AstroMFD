import {ButtonAttributes, ButtonSound, ButtonType, InputKey} from "@common/shared/models";
import {Toggle} from "./Toggle.tsx";
import {InputKeySelector} from "./InputKeySelector.tsx";
import {SoundSelector} from "./SoundSelector.tsx";

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

  const handleInputKeyChange = (key: InputKey) => {
    onUpdate(Object.assign({}, attr, { input: { ...attr.input, key }}), "widget.button.button.key");
  };

  const handleDurationChange = (duration: number) => {
    onUpdate(Object.assign({}, attr, { input: { ...attr.input, duration }}), "widget.button.button.duration");
  };

  const toggleFixedDuration = () => {
    const fixedDuration = !attr.input.fixedDuration;
    onUpdate(Object.assign({}, attr, { input: { ...attr.input, fixedDuration }}), "widget.button.button.fixedDuration");
  };

  const handleNavTargetChange = (targetId: string) => {
    onUpdate(Object.assign({}, attr, { navTarget: targetId }), "widget.button.navTarget");
  };

  const handleSoundChange = (sound: ButtonSound) => {
    onUpdate(Object.assign({}, attr, { sound }), "widget.button.sound");
  };

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>ATTRIBUTES</h5>
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
            <InputKeySelector
              value={attr.input.key}
              onChange={handleInputKeyChange}
            />
            <div className="row gap-16 align-items-center">
              <span>Fixed Duration:</span>
              <Toggle onToggle={toggleFixedDuration} value={attr.input.fixedDuration} />
            </div>
            {attr.input.fixedDuration && (
              <div className="row gap-16 align-items-center">
                <span>Duration (ms):</span>
                <input
                  type="number"
                  min={50}
                  max={5000}
                  step={10}
                  disabled={!attr.input.fixedDuration}
                  value={attr.input.duration}
                  onChange={(evt) => handleDurationChange(Number.parseInt(evt.target.value))}
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
        <SoundSelector value={attr.sound} onChange={handleSoundChange} />
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
