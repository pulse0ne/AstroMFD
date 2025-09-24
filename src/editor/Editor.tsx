import {Layer, Rect, Stage} from "react-konva";
import {useEffect, useRef, useState} from "react";
import {
  findNextAvailableButton,
  Position,
  Screen,
  Size,
  Widget
} from "../types/widget.ts";
import {KonvaEventObject} from "konva/lib/Node";
import {Konva} from "konva/lib/_FullInternals";
import {AttributesPanel} from "./attributes-panel/AttributesPanel.tsx";
import {Toolbar} from "./Toolbar.tsx";
import {WidgetRenderer} from "../widgets/WidgetRenderer.tsx";

import "./styles.css";

const SCALE_FACTOR = 1.05;

export type EditorProps = {
  screen: Screen;
  onUpdate: (screen: Screen) => void;
  size: Size;
  onResize: (size: Size) => void;
};

export default function Editor({ screen, onUpdate, size, onResize }: EditorProps) {
  const [ selectedWidgetIndex, setSelectedWidgetIndex ] = useState<number|null>(null);
  const [ stageSize, setStageSize ] = useState<Size>({ width: 1200, height: 800 });
  const [ stagePosition, setStagePosition ] = useState<Position>({ x: 600, y: 400 });
  const [ stageScale, setStageScale ] = useState<number>(1.0);
  const stageContainerRef = useRef<HTMLDivElement|null>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    function handleResize() {
      console.log('handling resize');
      setStageSize({
        width: stageContainerRef.current?.offsetWidth ?? 1200,
        height: stageContainerRef.current?.offsetHeight ?? 800
      });
    }

    handleResize();

    setStagePosition({
      x: (stageContainerRef.current?.offsetWidth ?? 1200) / 2.0 - size.width / 2.0,
      y: (stageContainerRef.current?.offsetHeight ?? 800) / 2.0 - size.height / 2.0
    });

    console.log("registering resize listener");
    window.addEventListener("resize", handleResize);

    return () => {
      console.log("unregistering resize listener");
      window.removeEventListener("resize", handleResize);
    };
  }, [size]);

  // TODO: attach global keybinds in useEffect (clear them on return)

  const handleUpdate = ({ x, y, width, height }: Size & Position) => {
    if (selectedWidgetIndex === null) return;
    const widget = screen.widgets[selectedWidgetIndex];
    widget.shape.size = { width, height };
    widget.shape.position = { x, y };
    const widgets = [...screen.widgets];
    widgets.splice(selectedWidgetIndex, 1, widget);
    onUpdate({ ...screen, widgets });
  };

  const handleDeselect = (evt: KonvaEventObject<MouseEvent>) => {
    if (evt.target instanceof Konva.Stage || evt.target.id() === "bg") {
      setSelectedWidgetIndex(null);
    }
  };

  const handleStageDrag = (evt: KonvaEventObject<MouseEvent>)=> {
    if (evt.target instanceof Konva.Stage) {
      const evtPos = evt.target.position();
      setStagePosition({x: evtPos.x, y: evtPos.y});
    }
  };

  const handleWheel = (evt: KonvaEventObject<WheelEvent>) => {
    evt.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    const direction = evt.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * SCALE_FACTOR : oldScale / SCALE_FACTOR;

    setStageScale(newScale);

    setStagePosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleWidgetAdded = (widget: Widget) => {
    if (widget.type === "button") {
      widget.vjoyButton.button = findNextAvailableButton(screen.widgets);
    }
    const newWidgets = [...screen.widgets, widget];
    onUpdate({ ...screen, widgets: newWidgets });

    // TODO: revisit this hack
    setTimeout(() => {
      setSelectedWidgetIndex(newWidgets.length - 1);
    }, 0);
  };

  const handleScreenAdded = () => {
    // TODO
  };

  const handleDimensionsChange = (size: Size) => {
    onResize(size);
  };

  const handleAttributePanelUpdate = (widget: Widget) => {
    if (!selectedWidgetIndex) return;
    const widgets = [...screen.widgets];
    widgets[selectedWidgetIndex] = widget;
    onUpdate({ ...screen, widgets });
  };

  const selectedWidget = selectedWidgetIndex === null ? null : screen.widgets[selectedWidgetIndex];

  return (
    <div className="editor-container fill-y">
      <Toolbar
        dimensions={size}
        onAddWidget={handleWidgetAdded}
        onAddScreen={handleScreenAdded}
        onDimensionsChange={handleDimensionsChange}
      />
      <div className="row fill no-overflow">
        <div className="fill-y" style={{ background: "var(--toolbar-color-hex)", borderRight: "var(--border-light)" }}>
          TODO: Screens
        </div>
        <div className="flex-grow no-overflow relative" onContextMenu={(e) => e.preventDefault()}>
          {/*<div style={{ position: "absolute" }} className="fill scanlines"></div>*/}
          <div className="stage-container fill-y" ref={stageContainerRef}>
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              scaleX={stageScale}
              scaleY={stageScale}
              x={stagePosition.x}
              y={stagePosition.y}
              draggable
              onMouseDown={handleDeselect}
              onDragEnd={handleStageDrag}
              onWheel={handleWheel}
            >
              <Layer>
                <Rect
                  id="bg"
                  x={0}
                  y={0}
                  width={size.width}
                  height={size.height}
                  fill="#000"
                />
              </Layer>
              <Layer>
                {screen.widgets.map(((widget, ix) => (
                  <WidgetRenderer
                    key={widget.id}
                    widget={widget}
                    onSelect={() => setSelectedWidgetIndex(ix)}
                    onUpdate={handleUpdate}
                    isSelected={ix === selectedWidgetIndex}
                    state="primary"
                  />
                )))}
              </Layer>
            </Stage>
          </div>
        </div>
        <AttributesPanel
          selectedWidget={selectedWidget}
          onUpdate={handleAttributePanelUpdate}
        />
      </div>
    </div>
  );
}
