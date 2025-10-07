import {useAppWebsocket, WebsocketProvider} from "./websocket/WebsocketContext.tsx";
import ConnectionOverlay from "./ConnectionOverlay.tsx";
import {type CSSProperties, Fragment, useEffect, useState} from "react";
import {Button} from "./widgets/Button.tsx";
import type {ScreenSet} from "@common/shared/models";

const TEST: ScreenSet = {
  "id": "1",
  "name": "Test",
  "size": {
    "width": 1875,
    "height": 958
  },
  "screens": [
    {
      "id": "123",
      "name": "TestScreen",
      "backgroundColor": "black",
      "widgets": [
        {
          "id": "badef9af-4a2b-4324-a92d-8f8c01535f2d",
          "type": "button",
          "buttonType": "action",
          "vjoyButton": {
            "button": 1,
            "duration": 100
          },
          "navTarget": null,
          "shape": {
            "size": {
              "width": 200,
              "height": 100
            },
            "position": {
              "x": 10.0,
              "y": 12.0
            },
            "fill": "rgb(56, 30, 83)",
            "stroke": "rgb(130, 51, 152)",
            "strokeWidth": 1,
            "cornerRadius": 8
          },
          "text": {
            "text": "Button",
            "font": null,
            "fontSize": 16,
            "fontColor": "white",
            "horizontalAlignment": "center",
            "verticalAlignment": "middle"
          },
          "pressed": {
            "shape": {},
            "text": {}
          }
        }
      ]
    }
  ]
};

function App() {
  return (
    <WebsocketProvider>
      {/*<Dummy />*/}
      <Dummy2 />
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

function Dummy2() {
  const [screenSet] = useState<ScreenSet>(TEST);
  const [activeScreenIndex] = useState(0);
  const { sendMessage } = useAppWebsocket();

  const bgStyle: CSSProperties = {
    position: "relative",
    backgroundColor: screenSet.screens[activeScreenIndex].backgroundColor,
    width: screenSet.size.width,
    height: screenSet.size.height,
  };

  const handlePress = (button: number, duration: number) => {
    sendMessage({ press: { button, duration }});
  };

  return (
    <div style={bgStyle}>
      {screenSet.screens[activeScreenIndex].widgets.map(widget => (
        <Fragment key={widget.id}>
          {widget.type === "button" && (
            <Button attr={widget} onPress={handlePress} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

export default App;
