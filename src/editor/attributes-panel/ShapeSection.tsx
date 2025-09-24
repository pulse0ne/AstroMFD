import {ShapeAttributes} from "../../types/widget.ts";
import {ColorSwatch} from "./ColorSwatch.tsx";

export type ShapeSectionProps = {
  shapeAttr: ShapeAttributes;
  onUpdate: (attr: ShapeAttributes) => void;
};

export function ShapeSection({ shapeAttr, onUpdate }: ShapeSectionProps) {
  const handleColorChange = (key: "fill"|"stroke", value: string) => {
    onUpdate(Object.assign({}, shapeAttr, { [key]: value }));
  };

  const handleNumericalChange = (key: "strokeWidth"|"cornerRadius", value: number) => {
    onUpdate(Object.assign({}, shapeAttr, { [key]: value }));
  };

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>SHAPE</h5>
      <div className="row align-center gap-16">
        <span style={{ width: 50 }}>Fill:</span>
        <ColorSwatch
          color={shapeAttr.fill ?? undefined}
          onUpdate={c => handleColorChange("fill", c)}
          onAddRecentColor={c => console.log(c)}
        />
      </div>
      <div className="row align-center gap-16">
        <span style={{ width: 50 }}>Stroke:</span>
        <ColorSwatch
          color={shapeAttr.stroke ?? undefined}
          onUpdate={c => handleColorChange("stroke", c)}
          onAddRecentColor={c => console.log(c)}
        />
      </div>
      <div className="row align-center gap-16">
        <span style={{ width: 100 }}>Stroke Width:</span>
        <input
          type="number"
          min={0}
          style={{width: 75}}
          value={shapeAttr.strokeWidth}
          onChange={(evt) => handleNumericalChange("strokeWidth", Number.parseInt(evt.target.value))}
        />
      </div>
      <div className="row align-center gap-16">
        <span style={{ width: 100 }}>Corner Radius:</span>
        <input
          type="number"
          min={0}
          style={{ width: 75 }}
          value={shapeAttr.cornerRadius}
          onChange={(evt) => handleNumericalChange("cornerRadius", Number.parseInt(evt.target.value))}
        />
      </div>
    </div>
  );
}