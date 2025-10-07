import {ShapeAttributes} from "@common/shared/models";
import {ColorSwatch} from "./ColorSwatch.tsx";
import {useRecentColors} from "../../hooks/useRecentColors.ts";

export type ShapeSectionProps = {
  shapeAttr: ShapeAttributes;
  onUpdate: (attr: ShapeAttributes, type: string) => void;
};

export function ShapeSection({ shapeAttr, onUpdate }: ShapeSectionProps) {
  const { recentColors, addRecentColor } = useRecentColors();

  const handleColorChange = (key: "fill"|"stroke", value: string) => {
    onUpdate(Object.assign({}, shapeAttr, { [key]: value }), `widget.shape.${key}`);
  };

  const handleNumericalChange = (key: "strokeWidth"|"cornerRadius", value: number) => {
    onUpdate(Object.assign({}, shapeAttr, { [key]: value }), `widget.shape.${key}`);
  };

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>SHAPE</h5>
      <div className="row align-center gap-16">
        <span style={{ width: 50 }}>Fill:</span>
        <ColorSwatch
          color={shapeAttr.fill ?? undefined}
          recents={recentColors}
          onUpdate={c => handleColorChange("fill", c)}
          onAddRecentColor={addRecentColor}
        />
      </div>
      <div className="row align-center gap-16">
        <span style={{ width: 50 }}>Stroke:</span>
        <ColorSwatch
          color={shapeAttr.stroke ?? undefined}
          recents={recentColors}
          onUpdate={c => handleColorChange("stroke", c)}
          onAddRecentColor={addRecentColor}
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