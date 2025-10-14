import {
  MdAdd,
  MdArrowBackIos,
  MdClose, MdDesktopWindows,
  MdPhoneAndroid, MdPhoneIphone, MdTabletAndroid, MdTabletMac,
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
import {IconType} from "react-icons";

import "./toolbar.css";

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
    <div className="toolbar row align-items-center justify-content-space-between relative">
      <div className="row align-items-center">
        <MdArrowBackIos className="pointer m16-r" onClick={goBack} />
        <Popup
          open={addPopupOpen}
          closeOnDocumentClick
          onOpen={() => setAddPopupOpen(true)}
          onClose={() => setAddPopupOpen(false)}
          arrow={false}
          contentStyle={{ background: "var(--toolbar-color-hex)" }}
          trigger={
            <button className="p16-l">
              <div className="row align-items-center gap-4">
                <MdAdd size={15}/>
                <span>Add</span></div>
            </button>
          }
        >
          <AddWidgetMenuItem onClick={() => handleAddWidget(createButton)}>Button</AddWidgetMenuItem>
          <AddWidgetMenuItem onClick={() => handleAddWidget(createLabel)}>Label</AddWidgetMenuItem>
          <AddWidgetMenuItem onClick={() => handleAddWidget(createPanel)}>Panel</AddWidgetMenuItem>
          <div style={{ borderBottom: "var(--border-light)" }}></div>
          <AddWidgetMenuItem onClick={handleAddScreen}>Screen</AddWidgetMenuItem>
        </Popup>
      </div>
      <div className="fill-y row align-items-center gap-4 toolbar-centered-container">
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
            <div className="popup-menu-item row align-items-center gap-8" key={device.ipAddr} onClick={() => handleDeviceSync(device)}>
              <DeviceIcon deviceType={device.deviceType} />{device.ipAddr} - {device.viewportWidth}x{device.viewportHeight}
            </div>
          ))}
        </Popup>
      </div>
    </div>
  );
}

type DeviceIconProps = {
  deviceType: ClientInfo["deviceType"];
};

function DeviceIcon({ deviceType }: DeviceIconProps) {
  let Icon: IconType = MdDesktopWindows;
  switch(deviceType) {
    case "android-tablet":
      Icon = MdTabletAndroid;
      break;
    case "android-phone":
      Icon = MdPhoneAndroid;
      break;
    case "ios-tablet":
      Icon = MdTabletMac;
      break;
    case "ios-phone":
      Icon = MdPhoneIphone;
      break;
  }
  return (
    <Icon />
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
