import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {FontSpec, Position, ShapeAttributes, Size, TextAttributes, Widget} from "@common/shared/models";
import {SizePositionSection} from "./SizePositionSection.tsx";
import {ShapeSection} from "./ShapeSection.tsx";
import {TextSection} from "./TextSection.tsx";
import {ButtonSpecificsSection, ScreenIdAndName} from "./ButtonSpecificsSection.tsx";
import {MdRedo, MdUndo} from "react-icons/md";
import {IconType} from "react-icons";
import {useECStore} from "../../store";
import {activeScreenSelector, hasRedosSelector, hasUndosSelector, screensSelector} from "../../store/selectors.ts";

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
  isPressed: boolean;
  onUpdate: (updated: Widget, type: string) => void;
  togglePressed: () => void;
};

export function AttributesPanel({ ephemeralShapeState, selectedWidget, isPressed, onUpdate, togglePressed }: AttributesPanelProps) {
  const [ fonts, setFonts ] = useState<FontSpec[]>([]);
  const hasUndos = useECStore(hasUndosSelector);
  const hasRedos = useECStore(hasRedosSelector);
  const screens = useECStore(screensSelector);
  const currentScreen = useECStore(activeScreenSelector);
  const undo = useECStore(state => state.undo);
  const redo = useECStore(state => state.redo);

  useEffect(() => {
    invoke<FontSpec[]>("list_system_fonts").then(fonts => setFonts(fonts));
  }, []);

  const handleSizeChange = (size: Size) => {
    if (selectedWidget?.type === "button") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, size } }), "widget.size");
    } else if (selectedWidget?.type === "label") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, size } }), "widget.size");
    } else if (selectedWidget?.type === "panel") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, size } }), "widget.size");
    }
  };

  const handlePositionChange = (position: Position) => {
    if (selectedWidget?.type === "button") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, position } }), "widget.position");
    } else if (selectedWidget?.type === "label") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, position } }), "widget.position");
    } else if (selectedWidget?.type === "panel") {
      onUpdate(Object.assign({}, selectedWidget, { shape: { ...selectedWidget.shape, position } }), "widget.position");
    }
  };

  const handleShapeAttrChange = (attr: ShapeAttributes, type: string) =>  {
    onUpdate(Object.assign({}, selectedWidget, { shape: attr }), type);
  }

  const handlePressedShapeAttrChange = (attr: Partial<ShapeAttributes>, type: string) => {
    console.log(attr);
    if (selectedWidget?.type === "button") {
      const pressed = Object.assign({}, selectedWidget.pressed, { shape: attr });
      console.log(pressed);
      onUpdate(Object.assign({}, selectedWidget, { pressed }), type);
    }
  };

  const handleTextAttrChange = (attr: TextAttributes, type: string) => {
      onUpdate(Object.assign({}, selectedWidget, { text: attr }), type);
  };

  const handlePressedTextAttrChange = (attr: Partial<TextAttributes>, type: string) => {
    if (selectedWidget?.type === "button") {
      const pressed = Object.assign({}, selectedWidget.pressed, { text: attr });
      onUpdate(Object.assign({}, selectedWidget, { pressed }), type);
    }
  };

  const size = selectedWidget ? extractShapeAttr("size", ephemeralShapeState, selectedWidget) as Size : null;
  const position = selectedWidget ? extractShapeAttr("position", ephemeralShapeState, selectedWidget) as Position : null;
  const filteredScreens: ScreenIdAndName[] = screens
    .filter(screen => screen.id !== currentScreen?.id)
    .map(screen => ({ id: screen.id, name: screen.name }));

  console.log(selectedWidget);

  return (
    <div className="attributes-panel col fill-y" style={{overflowY: "auto"}}>
      <div
        className="row gap-16 align-center justify-center"
        style={{ borderBottom: "var(--border-light)", paddingBottom: 8 }}
      >
        <UndoRedoButton type="undo" disabled={!hasUndos} onClick={undo} />
        <UndoRedoButton type="redo" disabled={!hasRedos} onClick={redo} />
      </div>
      {!selectedWidget && (
        <div className="flex-grow row justify-center align-center">
          <div>No selection</div>
        </div>
      )}
      {selectedWidget?.type === "button" && (
        <div>
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

type UndoRedoButtonProps = {
  type: "undo"|"redo";
  onClick: () => void;
  disabled: boolean;
};

function UndoRedoButton({ type, onClick, disabled }: UndoRedoButtonProps) {
  const Icon: IconType = type === "undo" ? MdUndo : MdRedo;

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <Icon
      size={20}
      onClick={handleClick}
      style={{
        cursor: disabled ? undefined : "pointer",
        color: disabled ? "#666" : "var(--gradient-stop1)"
      }}
    />
  );
}
