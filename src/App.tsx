import { MemoryRouter, Route, Routes } from "react-router";

import { AvailableInputKeysProvider } from "./hooks/useAvailableInputKeys.tsx";
import { DevicesProvider } from "./hooks/useDevices.tsx";
import StatusBar from "./statusbar/StatusBar.tsx";
import { UpdateChecker } from "./UpdateChecker.tsx";
import { Creator } from "./views/Creator.tsx";
import { ScreenSetSelector } from "./views/ScreenSetSelector.tsx";

// TODO:
// - stylable carousel buttons
// - carousel buttons can't be deleted (maybe make these "locked" buttons have an attribute?)
// - move items in or out of a container
// - use last style for new widgets (fill + stroke + text styles)
// - warning on action builder for "unclosed" keydowns
// - FIX: duplicate screenset is broken

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
