import type { Position } from "@common/shared/models";

export function coordinatesFromAngle(
  width: number,
  height: number,
  angle: number,
): { start: Position; end: Position } {
  const rad = (angle * Math.PI) / 180;

  const cx = width / 2;
  const cy = height / 2;

  const half = Math.max(width, height) / 2;

  const dx = Math.cos(rad) * half;
  const dy = Math.sin(rad) * half;

  return {
    start: { x: cx - dx, y: cy - dy },
    end: { x: cx + dx, y: cy + dy },
  };
}
