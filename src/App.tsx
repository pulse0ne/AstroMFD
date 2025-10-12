import StatusBar from "./statusbar/StatusBar.tsx";
import {DevicesProvider} from "./hooks/useDevices.tsx";
import {MemoryRouter, Route, Routes, useNavigate} from "react-router";
import {Creator} from "./Creator.tsx";

/*--------------------
  TODO:
- Device identification
- Snapping/Guides/Grid
- Gradients
- Finish Audio feedback
- Finish Renaming of screens/screen sets
- Filters (CRT, more?)
- SVG choosing/editing
- Duplication of widgets (hook functions up to store & create controls)
- Deletion of screens (delete screen thumb file too)
- Confirmation modal for screen deletions
- Develop ScreenSet selector in desktop client (react router)
- Improved error-handling in Rust code
- Configuration (journal path, vjoy device, etc.)
- Include pre-built SVGs for button shapes
- Configurable shape # of sides (triangles, pentagons, hexagons, etc.)
- Render icon for use in app
- Nav triggers (open screen on specified journal event)
- Haptic feedback? (not supported in mobile safari)
- Color themes?
- Multiselect?
- README/wiki?
- Turn ED-specific stuff into "plugin" that can be enabled/disabled
- Explore alternative input methods? virtual keyboard (enigo)?
---------------------*/

function App() {
  return (
    <main>
      <DevicesProvider>
        <div className="fill col no-overflow">
          <div className="flex-grow col no-overflow">
            <MemoryRouter>
              <Routes>
                <Route path="/" element={<Dummy />} />
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

const Dummy = () => {
  const nav = useNavigate();
  return (
    <div className="fill row no-overflow align-center justify-center">
      <button onClick={() => nav("/creator/1")}>Creator</button>
    </div>
  );
};

export default App;
