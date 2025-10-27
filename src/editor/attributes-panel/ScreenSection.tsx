import {MdClose, MdDesktopWindows, MdPhoneAndroid, MdPhoneIphone, MdTabletAndroid, MdTabletMac} from "react-icons/md";
import Popup from "reactjs-popup";
import {useDevices} from "../../hooks/useDevices.tsx";
import {ChangeEvent, useState} from "react";
import {ClientInfo} from "../../types/websocket.ts";
import {useECStore} from "../../store";
import {IconType} from "react-icons";
import {ColorSwatch} from "./ColorSwatch.tsx";
import {activeScreenSelector} from "../../store/selectors.ts";
import {Toggle} from "./Toggle.tsx";

export function ScreenSection() {
  const [ syncPopupOpen, setSyncPopupOpen ] = useState(false);
  const screenSet = useECStore(state => state.screenSet);
  const activeScreen = useECStore(activeScreenSelector);
  const updateSize = useECStore(state => state.updateSize);
  const updateScreen = useECStore(state => state.updateScreen);

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

  const handleScreenBgColorChange = (color: string) => {
    if (activeScreen) {
      updateScreen(Object.assign({}, activeScreen, { backgroundColor: color }));
    }
  };

  const handleCrtToggle = () => {
    if (!activeScreen) return;
    updateScreen(Object.assign({}, activeScreen, { crtEffect: !activeScreen.crtEffect }));
  };

  return (
    <div className="col attribute-section gap-16">
      <div className="row align-items-center gap-4">
        <span>Size:</span>
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
      {/* filter (CRT), grid?, others? */}
      <div className="row gap-16 align-items-center">
        <span>Background:</span>
        <ColorSwatch
          recents={[]} // TODO
          color={activeScreen?.backgroundColor}
          onUpdate={handleScreenBgColorChange}
          onAddRecentColor={console.log}
        />
      </div>
      <div className="row gap-16 align-items-center">
        <span>CRT Effect:</span>
        <Toggle
          onToggle={handleCrtToggle}
          value={Boolean(activeScreen?.crtEffect)}
        />
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
