import { ChangeEvent, useState } from "react";
import { IconType } from "react-icons";
import {
  MdClose,
  MdDesktopWindows,
  MdPhoneAndroid,
  MdPhoneIphone,
  MdTabletAndroid,
  MdTabletMac,
} from "react-icons/md";
import Popup from "reactjs-popup";

import { useDevices } from "../../hooks/useDevices.tsx";
import { useAstroStore } from "../../store";
import { activeScreenSelector } from "../../store/selectors.ts";
import { ClientInfo } from "../../types/websocket.ts";
import { CollapsibleSection } from "./CollapsibleSection.tsx";
import { ColorSwatch } from "./ColorSwatch.tsx";
import { Toggle } from "./Toggle.tsx";

export type ScreenSectionProps = {
  effectsHidden: boolean;
  onToggleEffectsHidden: () => void;
};

export function ScreenSection({ effectsHidden, onToggleEffectsHidden }: ScreenSectionProps) {
  const [syncPopupOpen, setSyncPopupOpen] = useState(false);
  const screenSet = useAstroStore((state) => state.screenSet);
  const activeScreen = useAstroStore(activeScreenSelector);
  const updateSize = useAstroStore((state) => state.updateSize);
  const updateScreen = useAstroStore((state) => state.updateScreen);

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

  const handleEffectToggle = (
    effect: keyof NonNullable<typeof activeScreen>["effects"],
  ) => {
    if (!activeScreen) return;
    updateScreen({
      ...activeScreen,
      effects: {
        ...activeScreen.effects,
        [effect]: !activeScreen.effects[effect],
      },
    });
  };

  return (
    <>
      <CollapsibleSection title="Screen">
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
                  color: devices.length ? "var(--gradient-stop1)" : "#666",
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
            {devices.map((device) => (
              <div
                className="popup-menu-item row align-items-center gap-8"
                key={device.ipAddr}
                onClick={() => handleDeviceSync(device)}
              >
                <DeviceIcon deviceType={device.deviceType} />
                {device.ipAddr} - {device.viewportWidth}x{device.viewportHeight}
              </div>
            ))}
          </Popup>
        </div>
        <div className="row gap-16 align-items-center">
          <span>Background:</span>
          <ColorSwatch
            recents={[]}
            color={activeScreen?.backgroundColor}
            onUpdate={handleScreenBgColorChange}
            onAddRecentColor={console.log}
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Effects" defaultOpen={false}>
        <table>
          <tbody>
            <tr>
              <td>
                <span>Scanlines:</span>
              </td>
              <td>
                <Toggle
                  onToggle={() => handleEffectToggle("scanlines")}
                  value={Boolean(activeScreen?.effects?.scanlines)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <span>LCD Grid:</span>
              </td>
              <td>
                <Toggle
                  onToggle={() => handleEffectToggle("lcdGrid")}
                  value={Boolean(activeScreen?.effects?.lcdGrid)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <span>Phosphor Glow:</span>
              </td>
              <td>
                <Toggle
                  onToggle={() => handleEffectToggle("phosphorGlow")}
                  value={Boolean(activeScreen?.effects?.phosphorGlow)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <span>Vignette:</span>
              </td>
              <td>
                <Toggle
                  onToggle={() => handleEffectToggle("vignette")}
                  value={Boolean(activeScreen?.effects?.vignette)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <span>Flicker:</span>
              </td>
              <td>
                <Toggle
                  onToggle={() => handleEffectToggle("flicker")}
                  value={Boolean(activeScreen?.effects?.flicker)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <span>Chromatic Aberration:</span>
              </td>
              <td>
                <Toggle
                  onToggle={() => handleEffectToggle("chromaticAberration")}
                  value={Boolean(activeScreen?.effects?.chromaticAberration)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <span>Noise:</span>
              </td>
              <td>
                <Toggle
                  onToggle={() => handleEffectToggle("noise")}
                  value={Boolean(activeScreen?.effects?.noise)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}></div>

        <table>
          <tbody>
            <tr>
              <td>Hide effects in editor:</td>
              <td><Toggle value={effectsHidden} onToggle={onToggleEffectsHidden} /></td>
            </tr>
          </tbody>
        </table>
      </CollapsibleSection>
    </>
  );
}

type DeviceIconProps = {
  deviceType: ClientInfo["deviceType"];
};

function DeviceIcon({ deviceType }: DeviceIconProps) {
  let Icon: IconType = MdDesktopWindows;
  switch (deviceType) {
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
  return <Icon />;
}
