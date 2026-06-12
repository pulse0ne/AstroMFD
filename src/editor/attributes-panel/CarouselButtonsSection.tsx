import { CarouselButtonCorner, CarouselPageButton, ShapeAttributes, WidgetIcon } from "@common/shared/models";
import { useState } from "react";

import { CollapsibleSection } from "./CollapsibleSection.tsx";
import { IconSection } from "./IconSection.tsx";
import { ShapeSection } from "./ShapeSection.tsx";

export type CarouselButtonsSectionProps = {
  previous: CarouselPageButton;
  next: CarouselPageButton;
  onUpdate: (which: "previous" | "next", btn: CarouselPageButton) => void;
};

const CORNERS: { value: CarouselButtonCorner; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

export function CarouselButtonsSection({ previous, next, onUpdate }: CarouselButtonsSectionProps) {
  const [activeBtn, setActiveBtn] = useState<"previous" | "next">("previous");
  const btn = activeBtn === "previous" ? previous : next;

  const handleShapeUpdate = (shape: ShapeAttributes) => {
    onUpdate(activeBtn, { ...btn, shape });
  };

  const handleIconUpdate = (icon: WidgetIcon | null) => {
    if (icon) {
      onUpdate(activeBtn, { ...btn, icon });
    }
  };

  return (
    <CollapsibleSection title="Page Buttons">
      <div className="col gap-8">
        <div className="segmented-toggle">
          <button
            className={activeBtn === "previous" ? "active" : ""}
            onClick={() => setActiveBtn("previous")}
          >
            Previous
          </button>
          <button
            className={activeBtn === "next" ? "active" : ""}
            onClick={() => setActiveBtn("next")}
          >
            Next
          </button>
        </div>
        <div className="row align-items-center gap-16">
          <span style={{ width: 50, fontSize: 11 }}>Corner:</span>
          <select
            value={btn.corner}
            onChange={(e) => onUpdate(activeBtn, { ...btn, corner: e.target.value as CarouselButtonCorner })}
            style={{ flex: 1, fontSize: 11 }}
          >
            {CORNERS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="row align-items-center gap-16">
          <span style={{ width: 50, fontSize: 11 }}>Margin:</span>
          <input
            type="number"
            min={0}
            style={{ width: 50, fontSize: 11 }}
            value={btn.margin}
            onChange={(e) => onUpdate(activeBtn, { ...btn, margin: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="row align-items-center gap-16">
          <span style={{ width: 50, fontSize: 11 }}>Size:</span>
          <input
            type="number"
            min={12}
            style={{ width: 50, fontSize: 11 }}
            value={btn.shape.size.width}
            onChange={(e) => {
              const s = parseInt(e.target.value) || 24;
              onUpdate(activeBtn, { ...btn, shape: { ...btn.shape, size: { width: s, height: s } } });
            }}
          />
        </div>
        <ShapeSection
          shapeAttr={btn.shape}
          onUpdate={handleShapeUpdate}
        />
        <IconSection
          icon={btn.icon}
          onUpdate={handleIconUpdate}
        />
      </div>
    </CollapsibleSection>
  );
}
