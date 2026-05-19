import { InputKey, SpecialKey } from "@common/shared/models";

export type InputKeySelectorProps = {
  value: InputKey;
  onChange: (key: InputKey) => void;
};

const SPECIAL_KEYS: Array<{ value: SpecialKey; label: string }> = [
  { value: "enter", label: "Enter" },
  { value: "space", label: "Space" },
  { value: "tab", label: "Tab" },
  { value: "escape", label: "Escape" },
  { value: "backspace", label: "Backspace" },
  { value: "delete", label: "Delete" },
  { value: "home", label: "Home" },
  { value: "end", label: "End" },
  { value: "pageUp", label: "Page Up" },
  { value: "pageDown", label: "Page Down" },
  { value: "arrowUp", label: "Arrow Up" },
  { value: "arrowDown", label: "Arrow Down" },
  { value: "arrowLeft", label: "Arrow Left" },
  { value: "arrowRight", label: "Arrow Right" },
  { value: "leftShift", label: "Left Shift" },
  { value: "rightShift", label: "Right Shift" },
  { value: "leftCtrl", label: "Left Ctrl" },
  { value: "rightCtrl", label: "Right Ctrl" },
  { value: "leftAlt", label: "Left Alt" },
  { value: "rightAlt", label: "Right Alt" },
  { value: "capsLock", label: "Caps Lock" },
];

export function InputKeySelector({ value, onChange }: InputKeySelectorProps) {
  const handleTypeChange = (newType: InputKey["type"]) => {
    // Create a sensible default for each type
    switch (newType) {
      case "joystickButton":
        onChange({ type: "joystickButton", button: 1 });
        break;
      case "letter":
        onChange({ type: "letter", key: "A" });
        break;
      case "number":
        onChange({ type: "number", key: 0 });
        break;
      case "functionKey":
        onChange({ type: "functionKey", key: 1 });
        break;
      case "specialKey":
        onChange({ type: "specialKey", key: "enter" });
        break;
    }
  };

  const handleValueChange = (newValue: number | string) => {
    switch (value.type) {
      case "joystickButton":
        onChange({ ...value, button: Number(newValue) });
        break;
      case "letter":
        onChange({ ...value, key: String(newValue).toUpperCase() });
        break;
      case "number":
        onChange({ ...value, key: Number(newValue) });
        break;
      case "functionKey":
        onChange({ ...value, key: Number(newValue) });
        break;
      case "specialKey":
        onChange({ ...value, key: newValue as SpecialKey });
        break;
    }
  };

  return (
    <div className="row gap-16">
      <div className="row align-items-center gap-4">
        <span>Input Type:</span>
        <select
          value={value.type}
          onChange={(e) => handleTypeChange(e.target.value as InputKey["type"])}
        >
          <option value="joystickButton">Joystick Button</option>
          <option value="letter">Letter Key</option>
          <option value="number">Number Key</option>
          <option value="functionKey">Function Key</option>
          <option value="specialKey">Special Key</option>
        </select>
      </div>

      {value.type === "joystickButton" && (
        <div className="row align-items-center gap-4">
          <span>Button #:</span>
          <input
            type="number"
            min={1}
            max={128}
            step={1}
            value={value.button}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        </div>
      )}

      {value.type === "letter" && (
        <div className="row align-items-center gap-4">
          <span>Letter:</span>
          <select
            value={value.key}
            onChange={(e) => handleValueChange(e.target.value)}
          >
            {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.type === "number" && (
        <div className="row align-items-center gap-4">
          <span>Number:</span>
          <select
            value={value.key}
            onChange={(e) => handleValueChange(e.target.value)}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.type === "functionKey" && (
        <div className="row align-items-center gap-4">
          <span>Function Key:</span>
          <select
            value={value.key}
            onChange={(e) => handleValueChange(e.target.value)}
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                F{num}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.type === "specialKey" && (
        <div className="row align-items-center gap-4">
          <span>Special Key:</span>
          <select
            value={value.key}
            onChange={(e) => handleValueChange(e.target.value)}
          >
            {SPECIAL_KEYS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
