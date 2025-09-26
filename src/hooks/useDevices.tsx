import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {ClientInfo} from "../types/websocket.ts";
import useTauriListen from "./useTauriListen.tsx";

type DevicesContextValue = { devices: ClientInfo[] };

const DevicesContext = createContext<DevicesContextValue>({ devices: [] });

export function DevicesProvider({ children }: PropsWithChildren<{}>) {
  const [ devices, setDevices ] = useState<DevicesContextValue>({ devices: [] });
  const { lastEvent, unListen } = useTauriListen<ClientInfo[]>("clients-updated-event");

  console.log(lastEvent);

  useEffect(() => {
    if (lastEvent) {
      lastEvent.sort((a, b) => a.ipAddr.localeCompare(b.ipAddr));
      setDevices({ devices: lastEvent });
    }
  }, [lastEvent]);

  useEffect(() => {
    return () => {
      unListen().then(r => r());
    };
  }, []);

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
