import { useEffect } from "react";

import { useAppWebsocket } from "./websocket/WebsocketContext.tsx";

function detectDeviceType() {
  const ua = navigator.userAgent;

  const iOS = /iPad|iPhone|iPod/.test(ua);

  if (iOS) {
    if (/iPad/.test(ua)) {
      return "ios-tablet";
    } else {
      return "ios-phone";
    }
  }

  if (/android/i.test(ua)) {
    if (/mobile/i.test(ua)) {
      return "android-phone";
    } else {
      return "android-tablet";
    }
  }

  return "other";
}

const detectedDevice = detectDeviceType();

const lastViewportSize = { width: 0, height: 0 };

export function ViewportReporter() {
  const { sendMessage } = useAppWebsocket();

  useEffect(() => {
    function sendClientReport() {
      const { clientWidth: width, clientHeight: height } =
        document.documentElement;
      if (
        lastViewportSize.width !== width ||
        lastViewportSize.height !== height
      ) {
        sendMessage({
          clientReport: { width, height, device: detectedDevice },
        });
        lastViewportSize.width = width;
        lastViewportSize.height = height;
      }
    }
    console.log("sending initial client report");
    sendClientReport();

    function resizeWatcher() {
      console.log("got resize event");
      sendClientReport();
    }

    window.addEventListener("resize", resizeWatcher);

    return () => {
      document.removeEventListener("resize", resizeWatcher);
    };
  }, []);

  return <></>;
}
