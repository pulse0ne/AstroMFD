import {
  FontSpec,
  Position,
  ShapeAttributes,
  Size,
  TextAttributes,
  Widget,
} from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { useECStore } from "../../store";
import {
  activeScreenSelector,
  screensSelector,
} from "../../store/selectors.ts";
import {
  ButtonSpecificsSection,
  ScreenIdAndName,
} from "./ButtonSpecificsSection.tsx";
import { ScreenSection } from "./ScreenSection.tsx";
import { ShapeSection } from "./ShapeSection.tsx";
import { SizePositionSection } from "./SizePositionSection.tsx";
import { SliderSpecificsSection } from "./SliderSpecificsSection.tsx";
import { TextSection } from "./TextSection.tsx";

import "./attributes-panel.css";

function extractShapeAttr(
  attrType: "size" | "position",
  ephemeralShapeState: (Size & Position) | null,
  selectedWidget: Widget,
): Size | Position {
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
  isPressed: boolean;
  onUpdate: (updated: Widget, type: string) => void;
  togglePressed: () => void;
};

export function AttributesPanel({
  ephemeralShapeState,
  selectedWidget,
  isPressed,
  onUpdate,
  togglePressed,
}: AttributesPanelProps) {
  const [fonts, setFonts] = useState<FontSpec[]>([]);
  const screens = useECStore(screensSelector);
  const currentScreen = useECStore(activeScreenSelector);

  useEffect(() => {
    invoke<FontSpec[]>("list_system_fonts").then((fonts) => setFonts(fonts));
  }, []);

  const handleSizeChange = (size: Size) => {
    if (selectedWidget?.type === "button") {
      onUpdate(
        Object.assign({}, selectedWidget, {
          shape: { ...selectedWidget.shape, size },
        }),
        "widget.size",
      );
    } else if (selectedWidget?.type === "label") {
      onUpdate(
        Object.assign({}, selectedWidget, {
          shape: { ...selectedWidget.shape, size },
        }),
        "widget.size",
      );
    } else if (selectedWidget?.type === "panel") {
      onUpdate(
        Object.assign({}, selectedWidget, {
          shape: { ...selectedWidget.shape, size },
        }),
        "widget.size",
      );
    }
  };

  const handlePositionChange = (position: Position) => {
    if (selectedWidget?.type === "button") {
      onUpdate(
        Object.assign({}, selectedWidget, {
          shape: { ...selectedWidget.shape, position },
        }),
        "widget.position",
      );
    } else if (selectedWidget?.type === "label") {
      onUpdate(
        Object.assign({}, selectedWidget, {
          shape: { ...selectedWidget.shape, position },
        }),
        "widget.position",
      );
    } else if (selectedWidget?.type === "panel") {
      onUpdate(
        Object.assign({}, selectedWidget, {
          shape: { ...selectedWidget.shape, position },
        }),
        "widget.position",
      );
    }
  };

  const handleShapeAttrChange = (attr: ShapeAttributes, type: string) => {
    onUpdate(Object.assign({}, selectedWidget, { shape: attr }), type);
  };

  const handlePressedShapeAttrChange = (
    attr: Partial<ShapeAttributes>,
    type: string,
  ) => {
    if (selectedWidget?.type === "button") {
      const pressed = Object.assign({}, selectedWidget.pressed, {
        shape: attr,
      });
      onUpdate(Object.assign({}, selectedWidget, { pressed }), type);
    }
  };

  const handleTextAttrChange = (attr: TextAttributes, type: string) => {
    onUpdate(Object.assign({}, selectedWidget, { text: attr }), type);
  };

  const handlePressedTextAttrChange = (
    attr: Partial<TextAttributes>,
    type: string,
  ) => {
    if (selectedWidget?.type === "button") {
      const pressed = Object.assign({}, selectedWidget.pressed, { text: attr });
      onUpdate(Object.assign({}, selectedWidget, { pressed }), type);
    }
  };

  const size = selectedWidget
    ? (extractShapeAttr("size", ephemeralShapeState, selectedWidget) as Size)
    : null;
  const position = selectedWidget
    ? (extractShapeAttr(
        "position",
        ephemeralShapeState,
        selectedWidget,
      ) as Position)
    : null;
  const filteredScreens: ScreenIdAndName[] = screens
    .filter((screen) => screen.id !== currentScreen?.id)
    .map((screen) => ({ id: screen.id, name: screen.name }));

  return (
    <div className="attributes-panel col fill-y" style={{ overflowY: "auto" }}>
      {!selectedWidget && (
        <div>
          <h2 className="border-b p8-b">SCREEN</h2>
          <ScreenSection />
        </div>
      )}
      {selectedWidget?.type === "button" && (
        <div>
          <h2 className="border-b p8-b">BUTTON</h2>
          <ButtonSpecificsSection
            attr={selectedWidget}
            screens={filteredScreens}
            isPressed={isPressed}
            togglePressed={togglePressed}
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
            pressedAttr={selectedWidget.pressed.shape}
            isPressed={isPressed}
            onUpdate={handleShapeAttrChange}
            onUpdatePressed={handlePressedShapeAttrChange}
          />
          <TextSection
            textAttr={selectedWidget.text}
            pressedAttr={selectedWidget.pressed.text}
            isPressed={isPressed}
            onUpdate={handleTextAttrChange}
            onUpdatePressed={handlePressedTextAttrChange}
            fonts={fonts}
          />
        </div>
      )}
      {selectedWidget?.type === "label" && (
        <div>
          <h2 className="border-b p8-b">LABEL</h2>
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
          <h2 className="border-b p8-b">PANEL</h2>
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
      {selectedWidget?.type === "slider" && (
        <div>
          <h2 className="border-b p8-b">SLIDER</h2>
          <SliderSpecificsSection
            attr={selectedWidget}
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
    </div>
  );
}
