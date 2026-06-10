import {
  Position,
  ShapeAttributes,
  Size,
  TextAttributes,
  Widget,
  WidgetIcon,
} from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";

import { useECStore } from "../../store";
import {
  activeScreenSelector,
  screensSelector,
} from "../../store/selectors.ts";
import {
  ButtonSpecificsSection,
  ScreenIdAndName,
} from "./ButtonSpecificsSection.tsx";
import { CarouselSection } from "./CarouselSection.tsx";
import { IconSection } from "./IconSection.tsx";
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
  const screenSetId = useECStore((state) => state.screenSet?.id ?? "");
  const screens = useECStore(screensSelector);
  const currentScreen = useECStore(activeScreenSelector);
  const updateLastStyle = useECStore((state) => state.updateLastStyle);
  const updateLastTextStyle = useECStore((state) => state.updateLastTextStyle);

  const handleSizeChange = (size: Size) => {
    if (!selectedWidget) return;
    onUpdate(
      { ...selectedWidget, shape: { ...selectedWidget.shape, size } },
      "widget.size",
    );
  };

  const handlePositionChange = (position: Position) => {
    if (!selectedWidget) return;
    onUpdate(
      { ...selectedWidget, shape: { ...selectedWidget.shape, position } },
      "widget.position",
    );
  };

  const handleShapeAttrChange = (attr: ShapeAttributes, type: string) => {
    onUpdate(Object.assign({}, selectedWidget, { shape: attr }), type);
    updateLastStyle(attr);
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
    updateLastTextStyle(attr);
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

  const handleIconChange = (icon: WidgetIcon | null, type: string) => {
    if (!selectedWidget) return;
    onUpdate(Object.assign({}, selectedWidget, { icon }), type);
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
          <IconSection
            icon={selectedWidget.icon}
            onUpdate={handleIconChange}
          />
          <TextSection
            textAttr={selectedWidget.text}
            pressedAttr={selectedWidget.pressed.text}
            isPressed={isPressed}
            onUpdate={handleTextAttrChange}
            onUpdatePressed={handlePressedTextAttrChange}

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
          <IconSection
            icon={selectedWidget.icon}
            onUpdate={handleIconChange}
          />
          <TextSection
            textAttr={selectedWidget.text}
            onUpdate={handleTextAttrChange}

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
          <TextSection
            textAttr={selectedWidget.text}
            onUpdate={handleTextAttrChange}

          />
        </div>
      )}
      {selectedWidget?.type === "carousel" && (
        <div>
          <h2 className="border-b p8-b">CAROUSEL</h2>
          <CarouselSection
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
        </div>
      )}
      {selectedWidget?.type === "image" && (
        <div>
          <h2 className="border-b p8-b">IMAGE</h2>
          <div className="col attribute-section gap-8">
            <div className="row gap-8 align-items-center">
              <span>File:</span>
              <span style={{ opacity: 0.7, fontSize: 11 }}>
                {selectedWidget.file || "None"}
              </span>
            </div>
            <button
              onClick={async () => {
                try {
                  const filename = await invoke<string>("import_image", { screenSetId, path: null });
                  onUpdate({ ...selectedWidget, file: filename }, "widget.file");
                } catch (_) {}
              }}
            >
              Replace
            </button>
          </div>
          <SizePositionSection
            size={size!}
            position={position!}
            onSizeChange={handleSizeChange}
            onPositionChange={handlePositionChange}
          />
        </div>
      )}
    </div>
  );
}
