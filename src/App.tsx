import { MemoryRouter, Route, Routes } from "react-router";

import { AvailableInputKeysProvider } from "./hooks/useAvailableInputKeys.tsx";
import { DevicesProvider } from "./hooks/useDevices.tsx";
import StatusBar from "./statusbar/StatusBar.tsx";
import { UpdateChecker } from "./UpdateChecker.tsx";
import { Creator } from "./views/Creator.tsx";
import { ScreenSetSelector } from "./views/ScreenSetSelector.tsx";

/*--------------------
  TODO:
- ED-like SVG elems
- Collapsible sections in attribute panel?
- Haptic feedback? (not supported in mobile safari; will be hard to test; beta feature?)
- User color themes?

----- Elite: Dangerous -specific
- Turn ED-specific stuff into "plugin" that can be enabled/disabled
- Build out journal events (check out status.json)
- Nav triggers (open screen on specified ED journal event)
---------------------*/

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
