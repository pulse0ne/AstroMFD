import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {FontSpec} from "../../types/fonts.ts";
import {Position, ShapeAttributes, Size, TextAttributes, Widget} from "../../types/widget.ts";
import {SizePositionSection} from "./SizePositionSection.tsx";
import {ShapeSection} from "./ShapeSection.tsx";
import {TextSection} from "./TextSection.tsx";
import {ButtonSpecificsSection} from "./ButtonSpecificsSection.tsx";

function extractShapeAttr(attrType: "size"|"position", ephemeralShapeState: (Size & Position) | null, selectedWidget: Widget): Size | Position {
  if (ephemeralShapeState) {
    if (attrType === "size") {
      const { width, height } = ephemeralShapeState;
      return { width, height };
    }
    const { x, y } = ephemeralShapeState;
    return { x, y };
  }
  return selectedWidget.shape[attrType];
}

export type AttributesPanelProps = {
  ephemeralShapeState: (Size & Position) | null;
  selectedWidget: Widget | null;
  onUpdate: (updated: Widget, type: string) => void;
};

export function AttributesPanel({ ephemeralShapeState, selectedWidget, onUpdate }: AttributesPanelProps) {
  const [ fonts, setFonts ] = useState<FontSpec[]>([]);

  useEffect(() => {
    invoke<FontSpec[]>("list_system_fonts").then(fonts => setFonts(fonts));
  }, []);

  const handleSizeChange = (size: Size) => {
    if (selectedWidget?.type === "button") {
      // TODO: handle pressed for button
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, size } }), "widget.size");
    } else if (selectedWidget?.type === "label") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, size } }), "widget.size");
    } else if (selectedWidget?.type === "panel") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, size } }), "widget.size");
    }
  };

  const handlePositionChange = (position: Position) => {
    if (selectedWidget?.type === "button") {
      // TODO: handle pressed for button
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, position } }), "widget.position");
    } else if (selectedWidget?.type === "label") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, position } }), "widget.position");
    } else if (selectedWidget?.type === "panel") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, position } }), "widget.position");
    }
  };

  const handleShapeAttrChange = (attr: ShapeAttributes) =>  {
    if (selectedWidget?.type === "button") {
      // TODO: handle pressed state
      onUpdate(Object.assign({}, selectedWidget, { shape: attr }), "widget.shape");
    } else if (selectedWidget?.type === "label") {
      onUpdate(Object.assign({}, selectedWidget, { shape: attr }), "widget.shape");
    } else if (selectedWidget?.type === "panel") {
      onUpdate(Object.assign({}, selectedWidget, { shape: attr }), "widget.shape");
    }
  }

  const handleTextAttrChange = (attr: TextAttributes) => {
    console.log(attr);
    // TODO: handle pressed state
    if (selectedWidget?.type === "button") {
      onUpdate(Object.assign({}, selectedWidget, { text: attr }), "widget.text");
    } else if (selectedWidget?.type === "label") {
      onUpdate(Object.assign({}, selectedWidget, { text: attr }), "widget.text");
    }
  };

  const size = selectedWidget ? extractShapeAttr("size", ephemeralShapeState, selectedWidget) as Size : null;
  const position = selectedWidget ? extractShapeAttr("position", ephemeralShapeState, selectedWidget) as Position : null;

  return (
    <div className="attributes-panel fill-y" style={{ overflowY: "auto" }}>
      {!selectedWidget && (
        <div className="row justify-center align-center fill-y">
          <div>No selection</div>
        </div>
      )}
      {selectedWidget?.type === "button" && (
        <div>
          <ButtonSpecificsSection
            attr={selectedWidget}
            screens={{}}
            onUpdate={(widget, type) => onUpdate(widget, type)}
          />
          <SizePositionSection
            size={size!}
            position={position!}
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
      {selectedWidget?.type === "label" && (
        <div>
          <SizePositionSection
            size={size!}
            position={position!}
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
      {selectedWidget?.type === "panel" && (
        <div>
          <SizePositionSection
            size={size!}
            position={position!}
            onSizeChange={handleSizeChange}
            onPositionChange={handlePositionChange}
          />
          <ShapeSection
            shapeAttr={selectedWidget.shape}
            onUpdate={handleShapeAttrChange}
          />
        </div>
      )}
    </div>
  );
}
