import { Position, Size, Widget } from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import { Konva } from "konva/lib/_FullInternals";
import { KonvaEventObject } from "konva/lib/Node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdAdd, MdRemove } from "react-icons/md";
import {
  PiCopySimple,
  PiArrowLineUp,
  PiArrowLineDown,
  PiTrashSimple,
} from "react-icons/pi";
import { TbMagnet, TbMagnetOff } from "react-icons/tb";
import { Group, Layer, Line, Rect, Stage, Transformer } from "react-konva";

import { useECStore } from "../store";
import {
  activeScreenSelector,
  activeWidgetListSelector,
  activeWidgetSelector,
  editingContainerSelector,
} from "../store/selectors.ts";
import { computeSnapGuides, GuideLine } from "../utils/snapGuides.ts";
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
  const toggleWidget = useECStore((state) => state.toggleWidgetIndex);
  const unselectWidget = useECStore((state) => state.unsetActiveWidgetIndex);
  const activeWidgetIndex = useECStore((state) => state.activeWidgetIndex);
  const selectedIndices = useECStore((state) => state.selectedWidgetIndices);
  const updateWidget = useECStore((state) => state.updateWidget);
  const batchMoveWidgets = useECStore((state) => state.batchMoveWidgets);
  const screenSetId = useECStore((state) => state.screenSet?.id ?? "");
  const size = useECStore((state) => state.screenSet?.size);
  const nudgeWidget = useECStore((state) => state.nudge);
  const undo = useECStore((state) => state.undo);
  const redo = useECStore((state) => state.redo);
  const enterContainer = useECStore((state) => state.enterContainer);
  const exitContainer = useECStore((state) => state.exitContainer);
  const sendToFront = useECStore((state) => state.sendToFront);
  const sendToBack = useECStore((state) => state.sendToBack);

  const [isPressed, setPressed] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
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
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const contentGroupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const pendingSelectRef = useRef<number | null>(null);
  const didDragRef = useRef(false);

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
    if (!trRef.current || !stageRef.current) return;
    const widgets = visibleWidgets ?? [];
    const nodes = [...selectedIndices]
      .map((i) => widgets[i])
      .filter(Boolean)
      .map((w) => stageRef.current!.findOne('#' + w.id))
      .filter(Boolean) as Konva.Node[];
    trRef.current.nodes(nodes);
    trRef.current.getLayer()?.batchDraw();

    if (nodes.length <= 1) return;

    const startPositions = new Map<string, Position>();
    let dragLeaderId: string | null = null;

    const handleGroupDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
      dragLeaderId = e.target.id();
      didDragRef.current = true;
      for (const n of nodes) {
        startPositions.set(n.id(), { x: n.x(), y: n.y() });
      }
    };

    const handleGroupDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target.id() !== dragLeaderId) return;
      const leaderStart = startPositions.get(dragLeaderId!);
      if (!leaderStart) return;
      const dx = e.target.x() - leaderStart.x;
      const dy = e.target.y() - leaderStart.y;
      for (const n of nodes) {
        if (n.id() === dragLeaderId) continue;
        const start = startPositions.get(n.id());
        if (start) {
          n.x(start.x + dx);
          n.y(start.y + dy);
        }
      }
    };

    const handleGroupDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target.id() !== dragLeaderId) return;
      const moves: { id: string; position: Position }[] = nodes.map((n) => ({
        id: n.id(),
        position: { x: n.x(), y: n.y() },
      }));
      batchMoveWidgets(moves);
      dragLeaderId = null;
      startPositions.clear();
    };

    for (const node of nodes) {
      node.on('dragstart', handleGroupDragStart);
      node.on('dragmove', handleGroupDragMove);
      node.on('dragend', handleGroupDragEnd);
    }

    return () => {
      for (const node of nodes) {
        node.off('dragstart', handleGroupDragStart);
        node.off('dragmove', handleGroupDragMove);
        node.off('dragend', handleGroupDragEnd);
      }
    };
  }, [selectedIndices, visibleWidgets, batchMoveWidgets]);

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

      if (activeWidgetIndex === null && selectedIndices.size === 0) return;

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
    selectedIndices,
    removeActiveWidget,
    duplicateWidget,
    unselectWidget,
    editingContainerId,
    exitContainer,
    undo,
    redo,
  ]);

  useEffect(() => {
    if (!contextMenu) return;
    const dismiss = () => setContextMenu(null);
    window.addEventListener("mousedown", dismiss);
    return () => window.removeEventListener("mousedown", dismiss);
  }, [contextMenu]);

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
      clearGuides();
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
    didDragRef.current = true;
    if (activeWidget) {
      setEphemeralShapeState(ephState);
    }
  };

  const handleDeselect = (evt: KonvaEventObject<MouseEvent>) => {
    if (evt.target instanceof Konva.Stage || evt.target.id() === "bg") {
      unselectWidget();
      setContextMenu(null);
    }
  };

  const handleContextMenu = (evt: KonvaEventObject<PointerEvent>) => {
    evt.evt.preventDefault();
    const target = evt.target;
    if (target instanceof Konva.Stage || target.id() === "bg") {
      setContextMenu(null);
      return;
    }
    // Find the widget group (top-level group with an id)
    let node: any = target;
    while (node && !node.id()) {
      node = node.parent;
    }
    if (!node) return;
    const widgetId = node.id();
    const widgets = visibleWidgets ?? [];
    const ix = widgets.findIndex((w) => w.id === widgetId);
    if (ix !== -1) {
      selectWidget(ix);
      setContextMenu({ x: evt.evt.clientX, y: evt.evt.clientY });
    }
  };

  const handleDoubleClick = () => {
    if (editingContainerId) return;
    if (
      activeWidget &&
      (activeWidget.type === "carousel" || activeWidget.type === "panel")
    ) {
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

  const zoomTo = useCallback(
    (newScale: number) => {
      const containerWidth = stageContainerRef.current?.offsetWidth ?? 1200;
      const containerHeight = stageContainerRef.current?.offsetHeight ?? 800;
      const center = { x: containerWidth / 2, y: containerHeight / 2 };
      const mousePointTo = {
        x: (center.x - stagePosition.x) / stageScale,
        y: (center.y - stagePosition.y) / stageScale,
      };
      setStageScale(newScale);
      setStagePosition({
        x: center.x - mousePointTo.x * newScale,
        y: center.y - mousePointTo.y * newScale,
      });
    },
    [stagePosition, stageScale],
  );

  const handleDragSnap = useCallback(
    (pos: Position, dragSize: Size): Position => {
      if (!snapEnabled || !activeWidget) {
        setGuides([]);
        return pos;
      }
      const widgets = visibleWidgets ?? [];
      const result = computeSnapGuides(
        pos,
        dragSize,
        widgets,
        activeWidget.id,
        workspaceSize,
      );
      setGuides(result.guides);
      return { x: result.x, y: result.y };
    },
    [snapEnabled, activeWidget, visibleWidgets, workspaceSize],
  );

  const clearGuides = useCallback(() => setGuides([]), []);

  const handleWidgetSelect = useCallback((ix: number, multi: boolean) => {
    if (multi) {
      toggleWidget(ix);
      pendingSelectRef.current = null;
    } else if (selectedIndices.has(ix) && selectedIndices.size > 1) {
      pendingSelectRef.current = ix;
    } else {
      selectWidget(ix);
      pendingSelectRef.current = null;
    }
    didDragRef.current = false;
  }, [selectedIndices, selectWidget, toggleWidget]);

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
              Editing{" "}
              {editingContainer.type === "carousel" ? "Carousel" : "Panel"}
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
        {activeScreen?.effects?.scanlines && (
          <div
            style={{ position: "absolute" }}
            className="fill scanlines"
          ></div>
        )}
        {activeScreen?.effects?.lcdGrid && (
          <div style={{ position: "absolute" }} className="fill lcd-grid"></div>
        )}
        {activeScreen?.effects?.vignette && (
          <div style={{ position: "absolute" }} className="fill vignette"></div>
        )}
        {activeScreen?.effects?.phosphorGlow && (
          <div
            style={{ position: "absolute" }}
            className="fill phosphor-glow"
          ></div>
        )}
        {activeScreen?.effects?.flicker && (
          <div style={{ position: "absolute" }} className="fill flicker"></div>
        )}
        {activeScreen?.effects?.chromaticAberration && (
          <div
            style={{ position: "absolute" }}
            className="fill chromatic-aberration"
          ></div>
        )}
        {activeScreen?.effects?.noise && (
          <div style={{ position: "absolute" }} className="fill noise"></div>
        )}
        <div
          className="stage-container fill-y relative"
          ref={stageContainerRef}
        >
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
            onContextMenu={handleContextMenu}
            onMouseUp={() => {
              if (pendingSelectRef.current !== null && !didDragRef.current) {
                selectWidget(pendingSelectRef.current);
              }
              pendingSelectRef.current = null;
            }}
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
                          screenSetId={screenSetId}
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
                          screenSetId={screenSetId}
                          onSelect={(multi) => handleWidgetSelect(ix, multi)}
                          onCommitUpdate={handleUpdate}
                          onEphemeralUpdate={handleEphemeralUpdate}
                          onDragSnap={selectedIndices.has(ix) && selectedIndices.size === 1 ? handleDragSnap : undefined}
                          isSelected={selectedIndices.has(ix)}
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
                      screenSetId={screenSetId}
                      onSelect={(multi) => handleWidgetSelect(ix, multi)}
                      onCommitUpdate={handleUpdate}
                      onEphemeralUpdate={handleEphemeralUpdate}
                      onDragSnap={selectedIndices.has(ix) && selectedIndices.size === 1 ? handleDragSnap : undefined}
                      isSelected={selectedIndices.has(ix)}
                      state={isPressed ? "pressed" : "primary"}
                    />
                  ))
                )}
              </Group>
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                resizeEnabled={selectedIndices.size <= 1}
              />
              {guides.map((guide, i) =>
                guide.orientation === "vertical" ? (
                  <Line
                    key={`guide-${i}`}
                    points={[guide.position, 0, guide.position, workspaceSize.height]}
                    stroke="#ff6b9d"
                    strokeWidth={1 / stageScale}
                    dash={[4 / stageScale, 4 / stageScale]}
                    listening={false}
                  />
                ) : (
                  <Line
                    key={`guide-${i}`}
                    points={[0, guide.position, workspaceSize.width, guide.position]}
                    stroke="#ff6b9d"
                    strokeWidth={1 / stageScale}
                    dash={[4 / stageScale, 4 / stageScale]}
                    listening={false}
                  />
                ),
              )}
            </Layer>
          </Stage>
          <div className="zoom-control">
            <button
              onClick={() => setSnapEnabled((v) => !v)}
              title={snapEnabled ? "Disable snapping" : "Enable snapping"}
              style={{ opacity: snapEnabled ? 1 : 0.4 }}
            >
              {snapEnabled ? <TbMagnet /> : <TbMagnetOff />}
            </button>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)" }} />
            <button
              onClick={() => zoomTo(stageScale / SCALE_FACTOR)}
              title="Zoom out"
            >
              <MdRemove />
            </button>
            <span
              className="zoom-level"
              onClick={() => zoomTo(1)}
              title="Reset zoom"
            >
              {Math.round(stageScale * 100)}%
            </span>
            <button
              onClick={() => zoomTo(stageScale * SCALE_FACTOR)}
              title="Zoom in"
            >
              <MdAdd />
            </button>
          </div>
        </div>
      </div>
      {contextMenu && activeWidget && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="context-menu-item"
            onClick={() => { duplicateWidget(); setContextMenu(null); }}
          >
            <PiCopySimple size={14} /> Duplicate
          </div>
          <div
            className="context-menu-item"
            onClick={() => { sendToFront(); setContextMenu(null); }}
          >
            <PiArrowLineUp size={14} /> Bring to Front
          </div>
          <div
            className="context-menu-item"
            onClick={() => { sendToBack(); setContextMenu(null); }}
          >
            <PiArrowLineDown size={14} /> Send to Back
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item danger"
            onClick={() => { removeActiveWidget(); setContextMenu(null); }}
          >
            <PiTrashSimple size={14} /> Delete
          </div>
        </div>
      )}
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
