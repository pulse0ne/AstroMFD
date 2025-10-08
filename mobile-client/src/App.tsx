import {useAppWebsocket, WebsocketProvider} from "./websocket/WebsocketContext.tsx";
import ConnectionOverlay from "./ConnectionOverlay.tsx";
import {useEffect} from "react";

function App() {
  return (
    <WebsocketProvider>
      <ConnectionOverlay />
      <ViewportReporter />
    </WebsocketProvider>
  );
}

const lastViewportSize = { width: 0, height: 0 };

function ViewportReporter() {
  const { sendMessage } = useAppWebsocket();

  useEffect(() => {
    function sendViewportReport() {
      const { clientWidth: width, clientHeight: height } = document.documentElement;
      if (lastViewportSize.width !== width || lastViewportSize.height !== height) {
        sendMessage({ viewportReport: { width, height } });
        lastViewportSize.width = width;
        lastViewportSize.height = height;
      }
    }
    console.log("sending initial viewport dimensions");
    sendViewportReport();

    const mediaQuery = window.matchMedia("(orientation: portrait)");
    if (mediaQuery.matches) {
      console.log("portrait mode");
    } else {
      console.log("landscape mode");
    }

    function resizeWatcher() {
      console.log("got resize event");
      sendViewportReport();
    }

    window.addEventListener("resize", resizeWatcher);

    return () => {
      document.removeEventListener("resize", resizeWatcher);
    };
  }, []);

  return <></>;
}

export default App;
