import { IconLayout, IconPosition, SvgXmlNode, WidgetIcon } from "@common/shared/models";
import { useRef, useState } from "react";
import Popup from "reactjs-popup";

import { shapePresets } from "../../assets/shapes";
import { SvgUtils } from "../../utils/svg/parseSvg.ts";
import { CollapsibleSection } from "./CollapsibleSection.tsx";
import { SvgColorEditor } from "./SvgColorEditor.tsx";

export type IconSectionProps = {
  icon: WidgetIcon | null;
  onUpdate: (icon: WidgetIcon | null, type: string) => void;
};

const POSITIONS: { value: IconPosition; label: string }[] = [
  { value: "bottom", label: "Text Below" },
  { value: "top", label: "Text Above" },
  { value: "right", label: "Text Right" },
  { value: "left", label: "Text Left" },
];

const LAYOUTS: { value: IconLayout; label: string }[] = [
  { value: "centered", label: "Centered" },
  { value: "fit", label: "Fit" },
  { value: "equal", label: "Equal" },
];

export function IconSection({ icon, onUpdate }: IconSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presetsOpen, setPresetsOpen] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const svg = SvgUtils.parse(reader.result as string);
        onUpdate(
          { svg, size: 24, position: "bottom", gap: 4, layout: "centered" },
          "widget.icon",
        );
      } catch (err) {
        console.error("Failed to parse SVG:", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePreset = (rawSvg: string) => {
    try {
      const svg = SvgUtils.parse(rawSvg);
      onUpdate(
        { svg, size: 24, position: icon?.position ?? "bottom", gap: icon?.gap ?? 4, layout: icon?.layout ?? "centered" },
        "widget.icon",
      );
      setPresetsOpen(false);
    } catch (err) {
      console.error("Failed to parse preset SVG:", err);
    }
  };

  const handleRemove = () => {
    onUpdate(null, "widget.icon");
  };

  const handleSvgUpdate = (svg: SvgXmlNode) => {
    if (!icon) return;
    onUpdate({ ...icon, svg }, "widget.icon.svg");
  };

  const handleSize = (size: number) => {
    if (!icon) return;
    onUpdate({ ...icon, size }, "widget.icon.size");
  };

  const handlePosition = (position: IconPosition) => {
    if (!icon) return;
    onUpdate({ ...icon, position }, "widget.icon.position");
  };

  const handleGap = (gap: number) => {
    if (!icon) return;
    onUpdate({ ...icon, gap }, "widget.icon.gap");
  };

  const handleLayout = (layout: IconLayout) => {
    if (!icon) return;
    onUpdate({ ...icon, layout }, "widget.icon.layout");
  };

  return (
    <CollapsibleSection title="Icon" defaultOpen={!!icon}>
      <div className="col gap-8">
        <div className="row align-items-center gap-8">
          {icon ? (
            <div className="row align-items-center gap-8">
              <span style={{ fontSize: 11, opacity: 0.6 }}>Active</span>
              <button className="btn btn-sm" onClick={handleRemove}>
                REMOVE
              </button>
              <Popup
                open={presetsOpen}
                onOpen={() => setPresetsOpen(true)}
                onClose={() => setPresetsOpen(false)}
                trigger={<button className="btn btn-sm">CHANGE</button>}
                position="bottom right"
                arrow={false}
                closeOnDocumentClick
                contentStyle={{
                  background: "var(--panel-color-hex)",
                  border: "var(--border-light)",
                  borderRadius: 6,
                  padding: 8,
                  width: 240,
                  height: 260,
                  maxHeight: 260,
                  overflowY: "scroll"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 6,
                  }}
                >
                  {shapePresets.map((preset) => (
                    <div
                      key={preset.name}
                      title={preset.name}
                      onClick={() => handlePreset(preset.svg)}
                      style={{
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="shape-preset-item"
                      dangerouslySetInnerHTML={{ __html: preset.svg }}
                    />
                  ))}
                </div>
              </Popup>
            </div>
          ) : (
            <>
              <Popup
                open={presetsOpen}
                onOpen={() => setPresetsOpen(true)}
                onClose={() => setPresetsOpen(false)}
                trigger={<button className="btn btn-sm">PRESETS</button>}
                position="bottom right"
                arrow={false}
                closeOnDocumentClick
                contentStyle={{
                  background: "var(--panel-color-hex)",
                  border: "var(--border-light)",
                  borderRadius: 6,
                  padding: 8,
                  width: 240,
                  height: 260,
                  overflowY: "scroll"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 6,
                  }}
                >
                  {shapePresets.map((preset) => (
                    <div
                      key={preset.name}
                      title={preset.name}
                      onClick={() => handlePreset(preset.svg)}
                      style={{
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="shape-preset-item"
                      dangerouslySetInnerHTML={{ __html: preset.svg }}
                    />
                  ))}
                </div>
              </Popup>
              <button
                className="btn btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                IMPORT
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            style={{ display: "none" }}
            onChange={handleImport}
          />
        </div>
      </div>
      {icon && (
        <div className="col gap-12">
          <div className="row align-items-center gap-16">
            <span style={{ width: 60 }}>Position:</span>
            <select
              value={icon.position}
              onChange={(e) => handlePosition(e.target.value as IconPosition)}
              style={{ flex: 1 }}
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="row align-items-center gap-16">
            <span style={{ width: 60 }}>Size:</span>
            <input
              type="number"
              min={8}
              max={256}
              style={{ width: 65 }}
              value={icon.size}
              onChange={(e) => handleSize(parseInt(e.target.value) || 24)}
            />
          </div>
          <div className="row align-items-center gap-16">
            <span style={{ width: 60 }}>Gap:</span>
            <input
              type="number"
              min={0}
              style={{ width: 65 }}
              value={icon.gap}
              onChange={(e) => handleGap(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="row align-items-center gap-16">
            <span style={{ width: 60 }}>Layout:</span>
            <select
              value={icon.layout ?? "centered"}
              onChange={(e) => handleLayout(e.target.value as IconLayout)}
              style={{ flex: 1 }}
            >
              {LAYOUTS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <SvgColorEditor svg={icon.svg} onUpdate={handleSvgUpdate} />
        </div>
      )}
    </CollapsibleSection>
  );
}
