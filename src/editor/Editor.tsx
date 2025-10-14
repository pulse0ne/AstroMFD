import {Group, Layer, Rect, Stage} from "react-konva";
import {useEffect, useMemo, useRef, useState} from "react";
import {KonvaEventObject} from "konva/lib/Node";
import {Konva} from "konva/lib/_FullInternals";
import {AttributesPanel} from "./attributes-panel/AttributesPanel.tsx";
import {WidgetRenderer} from "../widgets/WidgetRenderer.tsx";
import {useECStore} from "../store";
import {invoke} from "@tauri-apps/api/core";
import {activeScreenSelector, activeWidgetSelector} from "../store/selectors.ts";
import {Position, Size, Widget} from "@common/shared/models";
// import "./styles.css";
import "./editor.css";

const SCALE_FACTOR = 1.05;

export default function Editor() {
  const activeScreen = useECStore(activeScreenSelector);
  const activeWidget = useECStore(activeWidgetSelector);
  const removeActiveWidget = useECStore(state => state.deleteActiveWidget);
  const selectWidget = useECStore(state => state.setActiveWidgetIndex);
  const unselectWidget = useECStore(state => state.unsetActiveWidgetIndex);
  const activeWidgetIndex = useECStore(state => state.activeWidgetIndex);
  const updateWidget = useECStore(state => state.updateWidget);
  const size = useECStore(state => state.screenSet?.size);
  const nudgeWidget = useECStore(state => state.nudge);

  const [ isPressed, setPressed ] = useState(false);
  const [ ephemeralShapeState, setEphemeralShapeState ] = useState<(Size & Position) | null>(null);
  const [ stageSize, setStageSize ] = useState<Size>({ width: 1200, height: 800 });
  const [ stagePosition, setStagePosition ] = useState<Position>({ x: 600, y: 400 });
  const [ stageScale, setStageScale ] = useState<number>(1.0);
  const stageContainerRef = useRef<HTMLDivElement|null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const contentGroupRef = useRef<Konva.Group>(null);

  const workspaceSize = useMemo(() => size ?? { width: 1200, height: 800 }, [size]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeScreen && contentGroupRef.current) {
        contentGroupRef.current.toBlob({
          width: workspaceSize.width * stageScale,
          height: workspaceSize.height * stageScale,
          pixelRatio: 0.25
        }).then(res => {
            const blob = res as Blob;
            return blob.arrayBuffer()
              .then(buffer => {
                return invoke("save_screen_img", { id: activeScreen.id, data: new Uint8Array(buffer) });
              });
          })
          .catch(e => console.error(e));
      }
    }, 5000);
    return () => {
      clearTimeout(timeout);
    };
  }, [activeScreen, size]);

  useEffect(() => {
    if (activeWidgetIndex === null) return;

    const handler = (e: KeyboardEvent) => {
      const tagName = (e.target as HTMLElement).tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA") {
        return;
      }

      const amount = e.ctrlKey ? 10 : 1;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          nudgeWidget(0, -1 * amount);
          break;
        case "ArrowDown":
          e.preventDefault();
          nudgeWidget(0, 1 * amount);
          break;
        case "ArrowLeft":
          e.preventDefault();
          nudgeWidget(-1 * amount, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          nudgeWidget(1 * amount, 0);
          break;
        case "Delete":
        case "Backspace":
          e.preventDefault();
          removeActiveWidget();
          break;
        // TODO: ctrl-c, ctrl-v, ctrl-x, ctrl-z
      }
    };

    // console.log("registering key handlers");
    window.addEventListener("keydown", handler);
    return () => {
      // console.log("removing key handlers");
      window.removeEventListener("keydown", handler);
    };
  }, [activeWidgetIndex, removeActiveWidget]);

  useEffect(() => {
    function handleResize() {
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

    // console.log("registering resize listener");
    window.addEventListener("resize", handleResize);

    return () => {
      // console.log("unregistering resize listener");
      window.removeEventListener("resize", handleResize);
    };
  }, [size]);

  const handleUpdate = ({ x, y, width, height }: Size & Position, type: string) => {
    if (activeWidget) {
      setEphemeralShapeState(null);
      updateWidget({ ...activeWidget, shape: { ...activeWidget.shape, size: { width, height }, position: { x, y } }}, type);
    }
  };

  const handleEphemeralUpdate = (ephState: Size & Position) => {
    if (activeWidget) {
      setEphemeralShapeState(ephState);
    }
  };

  const handleDeselect = (evt: KonvaEventObject<MouseEvent>) => {
    if (evt.target instanceof Konva.Stage || evt.target.id() === "bg") {
      unselectWidget();
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
    if (!pointer) return;

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

  const handleAttributePanelUpdate = (widget: Widget, type: string) => {
    if (activeWidget) {
      console.log("widget", widget);
      updateWidget(widget, type);
    }
  };

  return (
    <div className="row flex-grow no-overflow">
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
              <Group ref={contentGroupRef}>
                <Rect
                  id="bg"
                  x={0}
                  y={0}
                  width={workspaceSize.width}
                  height={workspaceSize.height}
                  fill="#000"
                />
                {/*<Grid*/}
                {/*  color="rgba(255, 0, 0, 0.3)"*/}
                {/*  width={workspaceSize.width}*/}
                {/*  height={workspaceSize.height}*/}
                {/*  gridSize={50}*/}
                {/*  zoomLevel={stageScale}*/}
                {/*/>*/}
                {activeScreen?.widgets.map(((widget, ix) => (
                  <WidgetRenderer
                    key={widget.id}
                    widget={widget}
                    onSelect={() => selectWidget(ix)}
                    onCommitUpdate={handleUpdate}
                    onEphemeralUpdate={handleEphemeralUpdate}
                    isSelected={ix === activeWidgetIndex}
                    state={isPressed ? "pressed" : "primary"}
                  />
                )))}
              </Group>
            </Layer>
          </Stage>
        </div>
      </div>
      <AttributesPanel
        ephemeralShapeState={ephemeralShapeState}
        selectedWidget={activeWidget}
        isPressed={isPressed}
        onUpdate={handleAttributePanelUpdate}
        togglePressed={() => setPressed(ov => !ov)}
      />
    </div>
  );
}


//// Experiment
// type GridProps = {
//   color: string;
//   width: number;
//   height: number;
//   gridSize: number;
//   zoomLevel: number;
// };
// const Grid = ({ color, width, height, gridSize, zoomLevel }: GridProps) => {
//   console.log(zoomLevel);
//   const lines = [];
//   // Vertical lines
//   for (let i = 0; i < width / gridSize; i++) {
//     lines.push(
//       <Line
//         key={i}
//         points={[i * gridSize, 0, i * gridSize, height]}
//         stroke={color}
//         strokeWidth={1 / zoomLevel}
//       />
//     );
//   }
//   // Horizontal lines
//   for (let i = 0; i < height / gridSize; i++) {
//     lines.push(
//       <Line
//         key={i + width / gridSize}
//         points={[0, i * gridSize, width, i * gridSize]}
//         stroke={color}
//         strokeWidth={1 / zoomLevel}
//       />
//     );
//   }
//   return <>{lines}</>;
// }
