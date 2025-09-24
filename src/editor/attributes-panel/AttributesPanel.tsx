import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {FontSpec} from "../../types/fonts.ts";
import {Position, ShapeAttributes, Size, TextAttributes, Widget} from "../../types/widget.ts";
import {SizePositionSection} from "./SizePositionSection.tsx";
import {ShapeSection} from "./ShapeSection.tsx";
import {TextSection} from "./TextSection.tsx";

export type AttributesPanelProps = {
  selectedWidget: Widget | null;
  onUpdate: (updated: Widget) => void;
};

export function AttributesPanel({ selectedWidget, onUpdate }: AttributesPanelProps) {
  const [ fonts, setFonts ] = useState<FontSpec[]>([]);

  useEffect(() => {
    invoke<FontSpec[]>("list_system_fonts").then(fonts => setFonts(fonts));
  }, []);

  const handleSizeChange = (size: Size) => {
    if (selectedWidget?.type === "button") {
      // TODO: handle pressed for button
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, size } }));
    }
  };

  const handlePositionChange = (position: Position) => {
    if (selectedWidget?.type === "button") {
      // TODO: handle pressed for button
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, position } }));
    }
  };

  const handleShapeAttrChange = (attr: ShapeAttributes) =>  {
    if (selectedWidget?.type === "button") {
      // TODO: handle pressed state
      onUpdate(Object.assign({}, selectedWidget, { shape: attr }));
    }
  }

  const handleTextAttrChange = (attr: TextAttributes) => {
    console.log(attr);
    // TODO: handle pressed state
    if (selectedWidget?.type === "button") {
      onUpdate(Object.assign({}, selectedWidget, { text: attr }));
    }
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
          <SizePositionSection
            size={selectedWidget.shape.size}
            position={selectedWidget.shape.position}
            onSizeChange={handleSizeChange}
            onPositionChange={handlePositionChange}
          />
          <ShapeSection
            shapeAttr={selectedWidget.shape}
            onUpdate={handleShapeAttrChange}
          />
          <TextSection
            textAttr={selectedWidget.text}
            onUpdate={handleTextAttrChange}
            fonts={fonts}
          />
        </div>
      )}
    </div>
  );
}
