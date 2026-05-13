import { Position, Size } from "@common/shared/models";
import { useMemo } from "react";
import { IconType } from "react-icons";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";

import { useECStore } from "../../store";

export type SizePositionSectionProps = {
  size: Size;
  position: Position;
  onSizeChange: (size: Size) => void;
  onPositionChange: (position: Position) => void;
};

export function SizePositionSection({
  size,
  position,
  onSizeChange,
  onPositionChange,
}: SizePositionSectionProps) {
  const sendForward = useECStore((state) => state.sendForward);
  const sendBackward = useECStore((state) => state.sendBackward);
  const sendToFront = useECStore((state) => state.sendToFront);
  const sendToBack = useECStore((state) => state.sendToBack);

  const handleSizeChange = (key: keyof Size, value: number) => {
    if (key === "width") {
      onSizeChange({ width: value, height: size.height });
    } else {
      onSizeChange({ width: size.width, height: value });
    }
  };

  const handlePositionChange = (key: keyof Position, value: number) => {
    if (key === "x") {
      onPositionChange({ x: value, y: position.y });
    } else {
      onPositionChange({ x: position.x, y: value });
    }
  };

  return (
    <div className="attribute-section col gap-16" style={{ paddingTop: 16 }}>
      <h5>SIZE / POSITION</h5>
      <div className="row gap-4">
        <div className="flex-grow row">
          <span style={{ width: 24 }}>w:</span>
          <input
            type="number"
            style={{ width: 100 }}
            value={size.width}
            onChange={(event) =>
              handleSizeChange("width", Number.parseFloat(event.target.value))
            }
          />
        </div>
        <div className="flex-grow row">
          <span style={{ width: 24 }}>h:</span>
          <input
            type="number"
            style={{ width: 100 }}
            value={size.height}
            onChange={(event) =>
              handleSizeChange("height", Number.parseFloat(event.target.value))
            }
          />
        </div>
      </div>
      <div className="row gap-4">
        <div className="flex-grow row">
          <span style={{ width: 24 }}>x:</span>
          <input
            type="number"
            style={{ width: 100 }}
            value={position.x}
            onChange={(event) =>
              handlePositionChange("x", Number.parseFloat(event.target.value))
            }
          />
        </div>
        <div className="flex-grow row">
          <span style={{ width: 24 }}>y:</span>
          <input
            type="number"
            style={{ width: 100 }}
            value={position.y}
            onChange={(event) =>
              handlePositionChange("y", Number.parseFloat(event.target.value))
            }
          />
        </div>
      </div>
      <div className="row align-items-center">
        <span>Ordering:</span>
        <div
          className="flex-grow row align-items-center justify-content-space-around"
          style={{ padding: "0 24px" }}
        >
          <ArrangeIcon
            type="front"
            title="Send To Front"
            onClick={sendToFront}
          />
          <ArrangeIcon
            type="forward"
            title="Send Forward"
            onClick={sendForward}
          />
          <ArrangeIcon
            type="backward"
            title="Send Backward"
            onClick={sendBackward}
          />
          <ArrangeIcon type="back" title="Send To Back" onClick={sendToBack} />
        </div>
      </div>
    </div>
  );
}

type ArrangeIconProps = {
  type: "back" | "backward" | "front" | "forward";
  title: string;
  onClick: () => void;
};

function ArrangeIcon({ type, title, onClick }: ArrangeIconProps) {
  const Icon: IconType = useMemo(() => {
    switch (type) {
      case "back":
        return MdKeyboardDoubleArrowDown;
      case "backward":
        return MdKeyboardArrowDown;
      case "front":
        return MdKeyboardDoubleArrowUp;
      default:
        return MdKeyboardArrowUp;
    }
  }, [type]);
  return (
    <Icon
      size={24}
      className="pointer arrange-icon"
      title={title}
      onClick={onClick}
    />
  );
}
