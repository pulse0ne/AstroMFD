import type {Gradient} from "@common/shared/models";

export function gradientString(gradient: Gradient): string {
  const prefix = gradient.type === "linear" ? "linear-gradient(90deg," : "radial-gradient(circle,";
  return `${prefix} ${gradient.stops.map(s => `${s.color} ${s.position}%`).join(", ")})`;
}