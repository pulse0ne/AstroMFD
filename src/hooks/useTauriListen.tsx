import {useEffect, useState} from "react";
import {listen, UnlistenFn} from "@tauri-apps/api/event";

export default function useTauriListen<T>(eventType: string) {
  const [lastEvent, setLastEvent] = useState<T | null>(null);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    listen<T>(eventType, (event) => {
      // console.log(`got message (${eventType}): ${JSON.stringify(event.payload)}`);
      setLastEvent({ ...event.payload, _buster: Date.now() } as T);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [eventType]);

  return { lastEvent };
}