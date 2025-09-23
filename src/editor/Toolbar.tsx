import {createButton, createLabel, createPanel, Size, Widget} from "../types/widget.ts";
import {
  MdAdd,
  MdArrowBackIos,
  MdClose,
  MdPhoneAndroid,
} from "react-icons/md";
import {ChangeEvent, PropsWithChildren, useState} from "react";
import Popup from "reactjs-popup";
import {useDevices} from "../hooks/useDevices.tsx";
import {ClientInfo} from "../types/websocket.ts";

export type ToolbarProps = {
  dimensions: Size;
  onAddWidget: (widget: Widget) => void;
  onAddScreen: () => void;
  onDimensionsChange: (size: Size) => void;
};

export function Toolbar({ dimensions, onAddWidget, onAddScreen, onDimensionsChange }: ToolbarProps) {
  const [ addPopupOpen, setAddPopupOpen ] = useState(false);
  const [ syncPopupOpen, setSyncPopupOpen ] = useState(false);
  const { devices } = useDevices();

  const handleWidthChange = (evt: ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
    const width = Number.parseInt(evt.target.value);
    if (!isNaN(width)) {
      onDimensionsChange({ ...dimensions, width });
    }
  };

  const handleHeightChange = (evt: ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
    const height = Number.parseInt(evt.target.value);
    if (!isNaN(height)) {
      onDimensionsChange({ ...dimensions, height });
    }
  };

  const handleDeviceSync = (device: ClientInfo) => {
    const width = device.viewportWidth;
    const height = device.viewportHeight;
    onDimensionsChange({ width, height });
    setSyncPopupOpen(false);
  };

  const handleAddScreen = () => {
    setAddPopupOpen(false);
    onAddScreen();
  };

  const handleAddWidget = (createWidgetFn: () => Widget)=> {
    setAddPopupOpen(false);
    onAddWidget(createWidgetFn());
  };

  return (
    <div className="toolbar relative">
      <MdArrowBackIos style={{ marginRight: 16 }}/>
      <Popup
        open={addPopupOpen}
        closeOnDocumentClick
        onOpen={() => setAddPopupOpen(true)}
        onClose={() => setAddPopupOpen(false)}
        arrow={false}
        contentStyle={{ background: "var(--toolbar-color-hex)" }}
        trigger={
          <button style={{paddingLeft: 12}}>
            <div className="row align-center" style={{gap: 4}}><MdAdd size={15}/> Add</div>
          </button>
        }
      >
        <AddWidgetMenuItem onClick={() => handleAddWidget(createButton)}>Button</AddWidgetMenuItem>
        <AddWidgetMenuItem onClick={() => handleAddWidget(createLabel)}>Label</AddWidgetMenuItem>
        <AddWidgetMenuItem onClick={() => handleAddWidget(createPanel)}>Panel</AddWidgetMenuItem>
        <div style={{borderBottom: "var(--border-light)"}}></div>
        <AddWidgetMenuItem onClick={handleAddScreen}>Screen</AddWidgetMenuItem>
      </Popup>
      <div
        className="fill-y row align-center"
        style={{
          gap: 4,
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)"
      }}>

        <input
          style={{ width: 50 }}
          value={dimensions.width}
          type="number"
          min={0}
          onChange={handleWidthChange}
        />
        <MdClose size={12} />
        <input
          style={{ width: 50 }}
          value={dimensions.height}
          type="number"
          min={0}
          onChange={handleHeightChange}
        />

        <Popup
          trigger={
            <MdPhoneAndroid
              style={{
                cursor: devices.length ? "pointer" : undefined,
                color: devices.length ? "var(--gradient-stop1)" : "#666"
            }}
            />
          }
          open={syncPopupOpen}
          onOpen={() => setSyncPopupOpen(true)}
          onClose={() => setSyncPopupOpen(false)}
          contentStyle={{ background: "var(--toolbar-color-hex)" }}
          disabled={!devices.length}
          position="bottom center"
        >
          {devices.map(device => (
            <div className="popup-menu-item" key={device.ipAddr} onClick={() => handleDeviceSync(device)}>
              {device.ipAddr} - {device.viewportWidth}x{device.viewportHeight}
            </div>
          ))}
        </Popup>

      </div>
    </div>
  );
}

type AddWidgetMenuItemProps = PropsWithChildren<{
  onClick: () => void;
}>;

function AddWidgetMenuItem({ onClick, children }: AddWidgetMenuItemProps) {
  return (
    <div className="popup-menu-item" onClick={onClick}>
      {children}
    </div>
  );
}
