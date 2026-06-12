import { MemoryRouter, Route, Routes } from "react-router";

import { AvailableInputKeysProvider } from "./hooks/useAvailableInputKeys.tsx";
import { DevicesProvider } from "./hooks/useDevices.tsx";
import StatusBar from "./statusbar/StatusBar.tsx";
import { UpdateChecker } from "./UpdateChecker.tsx";
import { Creator } from "./views/Creator.tsx";
import { ScreenSetSelector } from "./views/ScreenSetSelector.tsx";

// TODO:
// - carousel: show/hide page indicators
// - move items in or out of a container

function App() {
  return (
    <main>
      <AvailableInputKeysProvider>
        <DevicesProvider>
          <div className="fill col no-overflow">
            <div className="flex-grow col no-overflow">
              <MemoryRouter>
                <Routes>
                  <Route path="/" element={<ScreenSetSelector />} />
                  <Route path="/creator/:screenSetId" element={<Creator />} />
                </Routes>
              </MemoryRouter>
            </div>
            <StatusBar />
          </div>
          <UpdateChecker />
        </DevicesProvider>
      </AvailableInputKeysProvider>
    </main>
  );
}

export default App;
