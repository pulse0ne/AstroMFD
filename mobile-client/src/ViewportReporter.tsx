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
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function sendClientReport() {
      const { clientWidth: width, clientHeight: height } =
        document.documentElement;
      if (width === 0 || height === 0) {
        retryTimer = setTimeout(sendClientReport, 100);
        return;
      }
      if (
        lastViewportSize.width === width &&
        lastViewportSize.height === height
      ) {
        return;
      }
      sendMessage({
        clientReport: { width, height, device: detectedDevice },
      });
      lastViewportSize.width = width;
      lastViewportSize.height = height;
    }

    requestAnimationFrame(sendClientReport);

    function resizeWatcher() {
      sendClientReport();
    }

    window.addEventListener("resize", resizeWatcher);

    return () => {
      window.removeEventListener("resize", resizeWatcher);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  return <></>;
}
