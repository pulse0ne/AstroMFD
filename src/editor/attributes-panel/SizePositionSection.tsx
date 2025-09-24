import {Position, Size} from "../../types/widget.ts";

export type SizePositionSectionProps = {
  size: Size;
  position: Position;
  onSizeChange: (size: Size) => void;
  onPositionChange: (position: Position) => void;
};

export function SizePositionSection({size, position, onSizeChange, onPositionChange}: SizePositionSectionProps) {

  const handleSizeChange = (key: keyof Size, value: number) => {
    if (key === "width") {
      onSizeChange({width: value, height: size.height});
    } else {
      onSizeChange({width: size.width, height: value});
    }
  };

  const handlePositionChange = (key: keyof Position, value: number) => {
    if (key === "x") {
      onPositionChange({x: value, y: position.y});
    } else {
      onPositionChange({x: position.x, y: value});
    }
  };

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>SIZE / POSITION</h5>
      <div className="row gap-4">
        <div className="flex-grow row">
          <span style={{width: 24}}>w:</span>
          <input
            type="number"
            style={{width: 100}}
            value={size.width}
            onChange={(event) => handleSizeChange("width", Number.parseFloat(event.target.value))}
          />
        </div>
        <div className="flex-grow row">
          <span style={{width: 24}}>h:</span>
          <input
            type="number"
            style={{width: 100}}
            value={size.height}
            onChange={(event) => handleSizeChange("height", Number.parseFloat(event.target.value))}
          />
        </div>
      </div>
      <div className="row gap-4">
        <div className="flex-grow row">
          <span style={{width: 24}}>x:</span>
          <input
            type="number"
            style={{width: 100}}
            value={position.x}
            onChange={(event) => handlePositionChange("x", Number.parseFloat(event.target.value))}
          />
        </div>
        <div className="flex-grow row">
          <span style={{width: 24}}>y:</span>
          <input
            type="number"
            style={{width: 100}}
            value={position.y}
            onChange={(event) => handlePositionChange("y", Number.parseFloat(event.target.value))}
          />
        </div>
      </div>
    </div>
  );
}