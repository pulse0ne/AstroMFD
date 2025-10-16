import StatusBar from "./statusbar/StatusBar.tsx";
import {DevicesProvider} from "./hooks/useDevices.tsx";
import {MemoryRouter, Route, Routes} from "react-router";
import {Creator} from "./views/Creator.tsx";
import {ScreenSetSelector} from "./views/ScreenSetSelector.tsx";

/*--------------------
  TODO:
- Finish Home Screen
- Finish Gradients
- Finish Audio feedback
- Finish Renaming of screens/screen sets
- Finish SVG modification (attribute panel)
- SVG rendering on client
- Screen Set Attribute Panel tab
- Snapping/Guides/Grid
- Filters (CRT, more?)
- SVG choosing/editing
- Duplication of widgets (hook functions up to store & create controls)
- Deletion of screens (delete screen thumb file too)
- Confirmation modal for screen deletions
- Improved error-handling in Rust code
- Configuration (journal path, vjoy device, etc.)
- Include pre-built SVGs for button shapes
- Configurable shape # of sides (triangles, pentagons, hexagons, etc.)
- Nav triggers (open screen on specified journal event)
- Haptic feedback? (not supported in mobile safari; will be hard to test; beta feature?)
- Multiselect konva components
- User color themes?
- README/wiki
- Turn ED-specific stuff into "plugin" that can be enabled/disabled
---------------------*/

function App() {
  return (
    <main>
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
      </DevicesProvider>
    </main>
  );
}

export default App;
