import { Position, Size, Widget } from "@common/shared/models";

export type GuideLine = {
  orientation: "horizontal" | "vertical";
  position: number;
};

export type SnapResult = {
  x: number;
  y: number;
  guides: GuideLine[];
};

const SNAP_THRESHOLD = 5;

type Bounds = { left: number; right: number; top: number; bottom: number; cx: number; cy: number };

function getBounds(widget: Widget): Bounds {
  const { x, y } = widget.shape.position;
  const { width, height } = widget.shape.size;
  return {
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
    cx: x + width / 2,
    cy: y + height / 2,
  };
}

export function computeSnapGuides(
  dragPos: Position,
  dragSize: Size,
  widgets: Widget[],
  activeWidgetId: string,
  canvasSize: Size,
): SnapResult {
  const dragBounds: Bounds = {
    left: dragPos.x,
    right: dragPos.x + dragSize.width,
    top: dragPos.y,
    bottom: dragPos.y + dragSize.height,
    cx: dragPos.x + dragSize.width / 2,
    cy: dragPos.y + dragSize.height / 2,
  };

  const vEdges: number[] = [0, canvasSize.width / 2, canvasSize.width];
  const hEdges: number[] = [0, canvasSize.height / 2, canvasSize.height];

  for (const widget of widgets) {
    if (widget.id === activeWidgetId) continue;
    const b = getBounds(widget);
    vEdges.push(b.left, b.right, b.cx);
    hEdges.push(b.top, b.bottom, b.cy);
  }

  let snappedX = dragPos.x;
  let snappedY = dragPos.y;
  const guides: GuideLine[] = [];

  let bestDx = SNAP_THRESHOLD + 1;
  let bestDy = SNAP_THRESHOLD + 1;

  for (const edge of vEdges) {
    for (const dragEdge of [dragBounds.left, dragBounds.right, dragBounds.cx]) {
      const d = Math.abs(dragEdge - edge);
      if (d < bestDx) {
        bestDx = d;
        snappedX = dragPos.x + (edge - dragEdge);
      }
    }
  }

  for (const edge of hEdges) {
    for (const dragEdge of [dragBounds.top, dragBounds.bottom, dragBounds.cy]) {
      const d = Math.abs(dragEdge - edge);
      if (d < bestDy) {
        bestDy = d;
        snappedY = dragPos.y + (edge - dragEdge);
      }
    }
  }

  if (bestDx <= SNAP_THRESHOLD) {
    const snappedBounds = {
      left: snappedX,
      right: snappedX + dragSize.width,
      cx: snappedX + dragSize.width / 2,
    };
    for (const edge of vEdges) {
      for (const dragEdge of [snappedBounds.left, snappedBounds.right, snappedBounds.cx]) {
        if (Math.abs(dragEdge - edge) < 0.5) {
          guides.push({ orientation: "vertical", position: edge });
        }
      }
    }
  } else {
    snappedX = dragPos.x;
  }

  if (bestDy <= SNAP_THRESHOLD) {
    const snappedBounds = {
      top: snappedY,
      bottom: snappedY + dragSize.height,
      cy: snappedY + dragSize.height / 2,
    };
    for (const edge of hEdges) {
      for (const dragEdge of [snappedBounds.top, snappedBounds.bottom, snappedBounds.cy]) {
        if (Math.abs(dragEdge - edge) < 0.5) {
          guides.push({ orientation: "horizontal", position: edge });
        }
      }
    }
  } else {
    snappedY = dragPos.y;
  }

  return { x: snappedX, y: snappedY, guides };
}
