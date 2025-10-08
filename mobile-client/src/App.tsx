import {WebsocketProvider} from "./websocket/WebsocketContext.tsx";
import ConnectionOverlay from "./ConnectionOverlay.tsx";
import {ViewportReporter} from "./ViewportReporter.tsx";
import {ScreenSetManager} from "./ScreenSetManager.tsx";

function App() {
  return (
    <WebsocketProvider>
      <ScreenSetManager />
      <ConnectionOverlay />
      <ViewportReporter />
    </WebsocketProvider>
  );
}

export default App;
