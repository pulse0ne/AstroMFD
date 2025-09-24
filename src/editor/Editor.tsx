import {Layer, Rect, Stage} from "react-konva";
import {useEffect, useRef, useState} from "react";
import {
  ButtonAttributes,
  ScreenSet,
  Position,
  Size,
  Widget,
  PanelAttributes,
  createPanel,
  LabelAttributes, createLabel
} from "../types/widget.ts";
import {KonvaEventObject} from "konva/lib/Node";
import {Konva} from "konva/lib/_FullInternals";
import {AttributesPanel} from "./attributes-panel/AttributesPanel.tsx";
import {Toolbar} from "./Toolbar.tsx";
import {WidgetRenderer} from "../widgets/WidgetRenderer.tsx";

import "./styles.css";

const TEST: ButtonAttributes = {
  id: "1",
  type: "button",
  vjoyButton: 1,
  buttonType: "action",
  navTarget: null,
  shape: {
    size: {width: 200, height: 100},
    position: {x: 200, y: 200},
    fill: "rgb(56, 30, 83)",
    stroke: "rgb(130, 51, 152)",
    strokeWidth: 1,
    cornerRadius: 8
  },
  text: {
    text: "Button",
    font: null,
    fontSize: 16,
    fontColor: "white",
    horizontalAlignment: "center",
    verticalAlignment: "middle"
  },
  pressed: {
    shape: {},
    text: {}
  }
};

const TEST_PANEL: PanelAttributes = createPanel();
const TEST_LABEL: LabelAttributes = createLabel();

const SCALE_FACTOR = 1.05;

export type EditorProps = {
  screenSet?: ScreenSet;
};

export default function Editor({  }: EditorProps) {
  const [ widgets, setWidgets ] = useState([TEST_PANEL, TEST_LABEL, TEST, Object.assign({}, JSON.parse(JSON.stringify(TEST)) as ButtonAttributes, { id: "2", shape: { ...TEST.shape, position: { x: 200, y: 400 } } })]);
  // const [ widgets, setWidgets ] = useState()

  const [ selectedItem, setSelectedItem ] = useState<number|null>(null);
  const [ workspaceSize, setWorkspaceSize ] = useState<Size>({ width: 1200, height: 800 });
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
      x: (stageContainerRef.current?.offsetWidth ?? 1200) / 2.0 - workspaceSize.width / 2.0,
      y: (stageContainerRef.current?.offsetHeight ?? 800) / 2.0 - workspaceSize.height / 2.0
    });

    console.log("registering resize listener");
    window.addEventListener("resize", handleResize);

    return () => {
      console.log("unregistering resize listener");
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleUpdate = ({ x, y, width, height }: Size & Position) => {
    if (selectedItem === null) return;
    const widget = widgets[selectedItem];
    widget.shape.size = { width, height };
    widget.shape.position = { x, y };
    setWidgets(ov => {
      ov.splice(selectedItem, 1, widget);
      return [...ov];
    });
  };

  const handleDeselect = (evt: KonvaEventObject<MouseEvent>) => {
    if (evt.target instanceof Konva.Stage || evt.target.id() === "bg") {
      setSelectedItem(null);
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
    console.log(widget);
    // TODO
  };

  const handleScreenAdded = () => {
    // TODO
  };

  const handleDimensionsChange = (size: Size) => {
    console.log(size);
    setWorkspaceSize(size);
  };

  const handleAttributePanelUpdate = (widget: Widget) => {
    if (!selectedItem) return;
    setWidgets(ov => {
      ov[selectedItem] = widget;
      return [...ov];
    });
  };

  const selectedWidget = selectedItem === null ? null : widgets[selectedItem];

  return (
    <div className="editor-container fill-y">
      <Toolbar
        dimensions={workspaceSize}
        onAddWidget={handleWidgetAdded}
        onAddScreen={handleScreenAdded}
        onDimensionsChange={handleDimensionsChange}
      />
      <div className="row fill no-overflow">
        <div className="fill-y" style={{ background: "var(--toolbar-color-hex)", borderRight: "var(--border-light)" }}>
          TODO: Screens
        </div>
        <div className="flex-grow no-overflow" onContextMenu={(e) => e.preventDefault()}>
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
                  width={workspaceSize.width}
                  height={workspaceSize.height}
                  fill="#000"
                />
              </Layer>
              <Layer>
                {widgets.map(((widget, ix) => (
                  <WidgetRenderer
                    key={widget.id}
                    widget={widget}
                    onSelect={() => setSelectedItem(ix)}
                    onUpdate={handleUpdate}
                    isSelected={ix === selectedItem}
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
