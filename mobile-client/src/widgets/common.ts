import type { TextAttributes } from "@common/shared/models";
import type { CSSProperties } from "react";

export const hAlignmentMap: Record<
  TextAttributes["horizontalAlignment"],
  CSSProperties["justifyItems"]
> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export const vAlignmentMap: Record<
  TextAttributes["verticalAlignment"],
  CSSProperties["alignContent"]
> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
};
