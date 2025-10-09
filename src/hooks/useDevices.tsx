import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {ClientInfo} from "../types/websocket.ts";
import useTauriListen from "./useTauriListen.tsx";
import {fastCopy} from "../utils/fastCopy.ts";

type DevicesContextValue = { devices: ClientInfo[] };

const DevicesContext = createContext<DevicesContextValue>({ devices: [] });

export function DevicesProvider({ children }: PropsWithChildren<{}>) {
  const [ devices, setDevices ] = useState<DevicesContextValue>({ devices: [] });
  const { lastEvent } = useTauriListen<{ devices: ClientInfo[]}>("clients-updated-event");

  useEffect(() => {
    if (lastEvent) {
      const devices = fastCopy(lastEvent.devices);
      devices.sort((a, b) => a.ipAddr.localeCompare(b.ipAddr));
      setDevices({ devices });
    }
  }, [lastEvent]);

  return (
    <DevicesContext.Provider value={devices}>
      {children}
    </DevicesContext.Provider>
  );
}

export function useDevices() {
  const ctx = useContext(DevicesContext);
  if (!ctx) {
    throw new Error("useDevices must be used inside DevicesProvider");
  }
  return ctx;
}
