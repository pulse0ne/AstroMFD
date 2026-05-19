import { Position, Size, Widget } from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import { Konva } from "konva/lib/_FullInternals";
import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";

import { useECStore } from "../store";
import {
  activeScreenSelector,
  activeWidgetListSelector,
  activeWidgetSelector,
  editingContainerSelector,
} from "../store/selectors.ts";
import { WidgetRenderer } from "../widgets/WidgetRenderer.tsx";
import { AttributesPanel } from "./attributes-panel/AttributesPanel.tsx";
import "./editor.css";

const SCALE_FACTOR = 1.05;

export default function Editor() {
  const activeScreen = useECStore(activeScreenSelector);
  const activeWidget = useECStore(activeWidgetSelector);
  const editingContainer = useECStore(editingContainerSelector);
  const editingContainerId = useECStore((state) => state.editingContainerId);
  const visibleWidgets = useECStore(activeWidgetListSelector);
  const removeActiveWidget = useECStore((state) => state.deleteActiveWidget);
  const duplicateWidget = useECStore((state) => state.duplicateActiveWidget);
  const selectWidget = useECStore((state) => state.setActiveWidgetIndex);
  const unselectWidget = useECStore((state) => state.unsetActiveWidgetIndex);
  const activeWidgetIndex = useECStore((state) => state.activeWidgetIndex);
  const updateWidget = useECStore((state) => state.updateWidget);
  const size = useECStore((state) => state.screenSet?.size);
  const nudgeWidget = useECStore((state) => state.nudge);
  const undo = useECStore((state) => state.undo);
  const redo = useECStore((state) => state.redo);
  const enterContainer = useECStore((state) => state.enterContainer);
  const exitContainer = useECStore((state) => state.exitContainer);

  const [isPressed, setPressed] = useState(false);
  const [ephemeralShapeState, setEphemeralShapeState] = useState<
    (Size & Position) | null
  >(null);
  const [stageSize, setStageSize] = useState<Size>({
    width: 1200,
    height: 800,
  });
  const [stagePosition, setStagePosition] = useState<Position>({
    x: 600,
    y: 400,
  });
  const [stageScale, setStageScale] = useState<number>(1.0);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const contentGroupRef = useRef<Konva.Group>(null);

  const workspaceSize = useMemo(
    () => size ?? { width: 1200, height: 800 },
    [size],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeScreen && contentGroupRef.current) {
        contentGroupRef.current
          .toBlob({
            width: workspaceSize.width * stageScale,
            height: workspaceSize.height * stageScale,
            pixelRatio: 0.25,
          })
          .then((res) => {
            const blob = res as Blob;
            return blob.arrayBuffer().then((buffer) => {
              return invoke("save_screen_img", {
                id: activeScreen.id,
                data: new Uint8Array(buffer),
              });
            });
          })
          .catch((e) => console.error(e));
      }
    }, 5000);
    return () => {
      clearTimeout(timeout);
    };
  }, [activeScreen, size]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tagName = (e.target as HTMLElement).tagName;
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT"
      ) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      if (ctrl && e.key === "d") {
        e.preventDefault();
        duplicateWidget();
        return;
      }
      if (e.key === "Escape") {
        if (editingContainerId) {
          exitContainer();
        } else {
          unselectWidget();
        }
        return;
      }

      if (activeWidgetIndex === null) return;

      const amount = ctrl ? 10 : 1;
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
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    activeWidgetIndex,
    removeActiveWidget,
    duplicateWidget,
    unselectWidget,
    editingContainerId,
    exitContainer,
    undo,
    redo,
  ]);

  useEffect(() => {
    function handleResize() {
      setStageSize({
        width: stageContainerRef.current?.offsetWidth ?? 1200,
        height: stageContainerRef.current?.offsetHeight ?? 800,
      });
    }

    handleResize();

    setStagePosition({
      x:
        (stageContainerRef.current?.offsetWidth ?? 1200) / 2.0 -
        workspaceSize.width / 2.0,
      y:
        (stageContainerRef.current?.offsetHeight ?? 800) / 2.0 -
        workspaceSize.height / 2.0,
    });

    // console.log("registering resize listener");
    window.addEventListener("resize", handleResize);

    return () => {
      // console.log("unregistering resize listener");
      window.removeEventListener("resize", handleResize);
    };
  }, [size]);

  const handleUpdate = (
    { x, y, width, height }: Size & Position,
    type: string,
  ) => {
    if (activeWidget) {
      setEphemeralShapeState(null);
      updateWidget(
        {
          ...activeWidget,
          shape: {
            ...activeWidget.shape,
            size: { width, height },
            position: { x, y },
          },
        },
        type,
      );
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

  const handleDoubleClick = () => {
    if (editingContainerId) return;
    if (activeWidget && (activeWidget.type === "carousel" || activeWidget.type === "panel")) {
      enterContainer(activeWidget.id);
    }
  };

  const handleStageDrag = (evt: KonvaEventObject<MouseEvent>) => {
    if (evt.target instanceof Konva.Stage) {
      const evtPos = evt.target.position();
      setStagePosition({ x: evtPos.x, y: evtPos.y });
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
    const newScale =
      direction > 0 ? oldScale * SCALE_FACTOR : oldScale / SCALE_FACTOR;

    setStageScale(newScale);

    setStagePosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleAttributePanelUpdate = (widget: Widget, type: string) => {
    if (activeWidget) {
      updateWidget(widget, type);
    }
  };

  return (
    <div className="row flex-grow no-overflow">
      <div
        className="flex-grow col no-overflow relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        {editingContainer && (
          <div
            style={{
              padding: "4px 12px",
              background: "rgba(79, 195, 247, 0.15)",
              borderBottom: "1px solid #4fc3f7",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ opacity: 0.7 }}>
              Editing {editingContainer.type === "carousel" ? "Carousel" : "Panel"}
            </span>
            {editingContainer.type === "carousel" && (
              <span style={{ opacity: 0.4 }}>
                Page {editingContainer.activePageIndex + 1} of{" "}
                {editingContainer.pages.length}
              </span>
            )}
            <button
              className="btn btn-sm"
              style={{ marginLeft: "auto", fontSize: 11 }}
              onClick={exitContainer}
            >
              Exit (Esc)
            </button>
          </div>
        )}
        {activeScreen?.crtEffect && (
          <div
            style={{ position: "absolute" }}
            className="fill scanlines"
          ></div>
        )}
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
            onClick={handleDeselect}
            onDblClick={handleDoubleClick}
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
                  fill={activeScreen?.backgroundColor}
                />
                {editingContainer ? (
                  <>
                    <Group listening={false} opacity={0.4}>
                      {activeScreen?.widgets.map((widget) => (
                        <WidgetRenderer
                          key={widget.id}
                          widget={widget}
                          onSelect={() => {}}
                          onCommitUpdate={() => {}}
                          onEphemeralUpdate={() => {}}
                          isSelected={false}
                          state="primary"
                        />
                      ))}
                    </Group>
                    <Rect
                      x={editingContainer.shape.position.x}
                      y={editingContainer.shape.position.y}
                      width={editingContainer.shape.size.width}
                      height={editingContainer.shape.size.height}
                      stroke="#4fc3f7"
                      strokeWidth={2}
                      dash={[6, 3]}
                      listening={false}
                    />
                    <Group
                      x={editingContainer.shape.position.x}
                      y={editingContainer.shape.position.y}
                    >
                      {visibleWidgets?.map((widget, ix) => (
                        <WidgetRenderer
                          key={widget.id}
                          widget={widget}
                          onSelect={() => selectWidget(ix)}
                          onCommitUpdate={handleUpdate}
                          onEphemeralUpdate={handleEphemeralUpdate}
                          isSelected={ix === activeWidgetIndex}
                          state={isPressed ? "pressed" : "primary"}
                        />
                      ))}
                    </Group>
                  </>
                ) : (
                  activeScreen?.widgets.map((widget, ix) => (
                    <WidgetRenderer
                      key={widget.id}
                      widget={widget}
                      onSelect={() => selectWidget(ix)}
                      onCommitUpdate={handleUpdate}
                      onEphemeralUpdate={handleEphemeralUpdate}
                      isSelected={ix === activeWidgetIndex}
                      state={isPressed ? "pressed" : "primary"}
                    />
                  ))
                )}
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
        togglePressed={() => setPressed((ov) => !ov)}
      />
    </div>
  );
}
