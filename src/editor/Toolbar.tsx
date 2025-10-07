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
import {useECStore} from "../store";
import {useNavigate} from "react-router";
import {activeScreenWidgetsSelector} from "../store/selectors.ts";
import {Widget} from "@common/shared/models";
import {createScreen} from "../utils/createScreen.ts";
import {findNextAvailableButton} from "../utils/findNextAvailableButton.ts";
import {createButton} from "../utils/createButton.ts";
import {createLabel} from "../utils/createLabel.ts";
import {createPanel} from "../utils/createPanel.ts";

export function Toolbar() {
  const [ addPopupOpen, setAddPopupOpen ] = useState(false);
  const [ syncPopupOpen, setSyncPopupOpen ] = useState(false);
  const screenSet = useECStore((state) => state.screenSet);
  const addScreen = useECStore((state) => state.addScreen);
  const addWidget = useECStore((state) => state.addWidget);
  const updateSize = useECStore((state) => state.updateSize);
  const widgets = useECStore(activeScreenWidgetsSelector);
  const navigate = useNavigate();
  const { devices } = useDevices();

  const handleWidthChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const width = Number.parseInt(evt.target.value);
    if (!isNaN(width)) {
      updateSize({ width, height: screenSet?.size?.height ?? 800 });
    }
  };

  const handleHeightChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const height = Number.parseInt(evt.target.value);
    if (!isNaN(height)) {
      updateSize({ width: screenSet?.size?.width ?? 1200, height });
    }
  };

  const handleDeviceSync = (device: ClientInfo) => {
    const width = device.viewportWidth;
    const height = device.viewportHeight;
    updateSize({ width, height });
    setSyncPopupOpen(false);
  };

  const handleAddScreen = () => {
    setAddPopupOpen(false);
    if (screenSet?.screens?.length) {
      addScreen(createScreen(screenSet.screens.length + 1));
    }
  };

  const handleAddWidget = (createWidgetFn: () => Widget)=> {
    setAddPopupOpen(false);
    const newWidget = createWidgetFn();
    if (newWidget.type === "button") {
      newWidget.vjoyButton.button = findNextAvailableButton(widgets ?? []);
    }
    addWidget(createWidgetFn());
  };

  const goBack = () => {
    navigate("/");
  };

  return (
    <div className="toolbar row align-center justify-space-between relative">
      <div className="row align-center">
        <MdArrowBackIos className="pointer" style={{ marginRight: 16 }} onClick={goBack} />
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
      </div>
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
          style={{ width: 56 }}
          value={screenSet?.size?.width ?? 1200}
          type="number"
          min={0}
          onChange={handleWidthChange}
        />
        <MdClose size={12} />
        <input
          style={{ width: 56 }}
          value={screenSet?.size?.height ?? 800}
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
