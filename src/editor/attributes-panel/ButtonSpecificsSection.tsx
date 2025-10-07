import {ButtonAction, ButtonAttributes, ButtonType} from "@common/shared/models";

type ScreenIdToName = Record<string, string>;

export type ButtonSpecificsSectionProps = {
  attr: ButtonAttributes;
  screens: ScreenIdToName;
  onUpdate: (attr: ButtonAttributes, type: string) => void;
};

export function ButtonSpecificsSection({ attr, screens, onUpdate }: ButtonSpecificsSectionProps) {

  const handleButtonTypeChange = (value: ButtonType) => {
    onUpdate(Object.assign({}, attr, { buttonType: value }), "widget.button.type");
  };

  const handleVjoyButtonChange = (key: keyof ButtonAction, value: number) => {
    onUpdate(Object.assign({}, attr, { vjoyButton: { ...attr.vjoyButton, [key]: value }}), "widget.button.button");
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
        {attr.buttonType === "action" && (
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
            <select value={attr.navTarget ?? ""}>
              <option value=""></option>
              {Object.entries(screens).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
