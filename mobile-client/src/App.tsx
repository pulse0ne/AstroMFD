import ConnectionOverlay from "./ConnectionOverlay.tsx";
import { ScreenSetManager } from "./ScreenSetManager.tsx";
import { ViewportReporter } from "./ViewportReporter.tsx";
import { WebsocketProvider } from "./websocket/WebsocketContext.tsx";

console.log(window.navigator.userAgent);

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
