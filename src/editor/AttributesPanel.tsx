import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {FontSpec} from "../types/fonts.ts";
import {Widget} from "../types/widget.ts";

export type AttributesPanelProps = {
  selectedWidget: Widget | null;
  onUpdate: (updated: Widget) => void;
};

export function AttributesPanel({ selectedWidget, onUpdate }: AttributesPanelProps) {
  const [ _fonts, setFonts ] = useState<FontSpec[]>([]);

  useEffect(() => {
    invoke<FontSpec[]>("list_system_fonts").then(fonts => setFonts(fonts));
  }, []);

  const handleButtonChange = (path: string, value: unknown) => {
    if (selectedWidget?.type !== "button") return;
    const parts = path.split(".");
    let current = selectedWidget as Record<string, any>;
    for (let i = 0; i < parts.length; i++) {
      const key = parts[i];

      if (i === parts.length - 1) {
        current[key] = value;
      } else {
        current = current[key];
      }
    }

    onUpdate(selectedWidget);
  };

  return (
    <div className="attributes-panel fill-y">
      {!selectedWidget && (
        <div className="row justify-center align-center fill-y">
          <div>No selection</div>
        </div>
      )}
      {selectedWidget?.type === "button" && (
        <div className="fill-y">
          <div className="attribute-section col gap-16">
            <h5>SIZE / POSITION</h5>
            <div className="row gap-4">
              <div className="flex-grow row">
                <span style={{ width: 24 }}>w:</span>
                <input
                  type="number"
                  style={{ width: 100 }}
                  value={selectedWidget.shape.size.width}
                  onChange={(event) => handleButtonChange("shape.size.width", Number.parseFloat(event.target.value))}
                />
              </div>
              <div className="flex-grow row">
                <span style={{ width: 24 }}>h:</span>
                <input
                  type="number"
                  style={{ width: 100 }}
                  value={selectedWidget.shape.size.height}
                  onChange={(event) => handleButtonChange("shape.size.height", Number.parseFloat(event.target.value))}
                />
              </div>
            </div>
            <div className="row gap-4">
              <div className="flex-grow row">
                <span style={{ width: 24 }}>x:</span>
                <input
                  type="number"
                  style={{ width: 100 }}
                  value={selectedWidget.shape.position.x}
                  onChange={(event) => handleButtonChange("shape.position.x", Number.parseFloat(event.target.value))}
                />
              </div>
              <div className="flex-grow row">
                <span style={{ width: 24 }}>y:</span>
                <input
                  type="number"
                  style={{ width: 100 }}
                  value={selectedWidget.shape.position.y}
                  onChange={(event) => handleButtonChange("shape.position.y", Number.parseFloat(event.target.value))}
                />
              </div>
            </div>
            <div className="row"></div>
          </div>
        </div>
      )}
    </div>
  );
}