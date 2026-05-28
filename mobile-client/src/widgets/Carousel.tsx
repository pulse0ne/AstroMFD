import type {
  ActionStep,
  CarouselAttributes,
  Gradient,
  InputKey,
  JoystickAxis,
} from "@common/shared/models";
import {
  Fragment,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { gradientString } from "../utils.ts";
import { Button } from "./Button.tsx";
import { Label } from "./Label.tsx";
import { Panel } from "./Panel.tsx";
import { Slider } from "./Slider.tsx";
import { SvgRenderer } from "./SvgRenderer.tsx";

export type CarouselProps = {
  attr: CarouselAttributes;
  onExecuteActions: (steps: ActionStep[]) => void;
  onDown: (key: InputKey) => void;
  onUp: (key: InputKey) => void;
  onNavigate: (target: string) => void;
  onAxisMove: (axis: JoystickAxis, value: number) => void;
};

const SWIPE_THRESHOLD = 40;

export function Carousel({
  attr,
  onExecuteActions,
  onDown,
  onUp,
  onNavigate,
  onAxisMove,
}: CarouselProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const translateXRef = useRef(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const fill = (() => {
    const f = attr.shape.fill;
    if (!f) return null;
    if (f.type === "solid") return f.value as string;
    if (f.type === "gradient") return gradientString(f.value as Gradient);
    return null;
  })();

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    translateXRef.current = e.clientX - startXRef.current;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    const len = attr.pages.length;
    if (translateXRef.current < -SWIPE_THRESHOLD) {
      setPageIndex((i) => (i + 1) % len);
    } else if (translateXRef.current > SWIPE_THRESHOLD) {
      setPageIndex((i) => (i - 1 + len) % len);
    }
    translateXRef.current = 0;
  }, [attr.pages.length]);

  const activePage = attr.pages[pageIndex];
  const nav = attr.navigation ?? "swipe";
  const allowSwipe = nav === "swipe" || nav === "both";
  const showButtons = nav === "buttons" || nav === "both";

  const containerStyle: CSSProperties = {
    position: "absolute",
    left: attr.shape.position.x,
    top: attr.shape.position.y,
    width: attr.shape.size.width,
    height: attr.shape.size.height,
    overflow: "hidden",
    background: attr.shape.svg ? undefined : (fill ?? "transparent"),
    borderWidth: attr.shape.svg ? undefined : attr.shape.strokeWidth,
    borderStyle: attr.shape.svg ? undefined : "solid",
    borderColor: attr.shape.svg
      ? undefined
      : (attr.shape.stroke ?? "transparent"),
    borderRadius: attr.shape.svg ? undefined : attr.shape.cornerRadius,
    touchAction: "pan-y",
  };

  const pageStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
  };

  const dotsStyle: CSSProperties = {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    gap: 6,
    pointerEvents: "none",
  };

  const navButtonStyle: CSSProperties = {
    position: "absolute",
    bottom: 4,
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: 4,
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    padding: "4px 10px",
    cursor: "pointer",
    zIndex: 1,
  };

  return (
    <div
      style={containerStyle}
      {...(allowSwipe && {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerUp,
      })}
    >
      {attr.shape.svg && (
        <SvgRenderer
          svg={attr.shape.svg}
          width={attr.shape.size.width}
          height={attr.shape.size.height}
        />
      )}
      {showButtons && attr.pages.length > 1 && (
        <>
          <button
            style={{ ...navButtonStyle, left: 4 }}
            onClick={() =>
              setPageIndex(
                (i) => (i - 1 + attr.pages.length) % attr.pages.length,
              )
            }
          >
            ‹
          </button>
          <button
            style={{ ...navButtonStyle, right: 4 }}
            onClick={() => setPageIndex((i) => (i + 1) % attr.pages.length)}
          >
            ›
          </button>
        </>
      )}
      <div style={pageStyle}>
        {activePage &&
          activePage.widgets.map((widget) => (
            <Fragment key={widget.id}>
              {widget.type === "button" && (
                <Button
                  attr={widget}
                  onExecuteActions={onExecuteActions}
                  onDown={onDown}
                  onUp={onUp}
                  onNavigate={onNavigate}
                />
              )}
              {widget.type === "slider" && (
                <Slider attr={widget} onAxisMove={onAxisMove} />
              )}
              {widget.type === "panel" && (
                <Panel
                  attr={widget}
                  onExecuteActions={onExecuteActions}
                  onDown={onDown}
                  onUp={onUp}
                  onNavigate={onNavigate}
                  onAxisMove={onAxisMove}
                />
              )}
              {widget.type === "label" && <Label attr={widget} />}
            </Fragment>
          ))}
      </div>
      {attr.pages.length > 1 && (
        <div style={dotsStyle}>
          {attr.pages.map((page, i) => (
            <div
              key={page.id}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  i === pageIndex
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
