import StatusBar from "./statusbar/StatusBar.tsx";
import {DevicesProvider} from "./hooks/useDevices.tsx";
import {MemoryRouter, Route, Routes, useNavigate} from "react-router";
import {Creator} from "./Creator.tsx";

/*--------------------
  TODO:
- Action button settings for duration == press length
- SVG choosing/editing
- Duplication of widgets (hook functions up to store & controls)
- Deletion of screens (delete screen thumb file too)
- Confirmation modal for screen deletions
- Renaming of screens/screen sets
- Develop ScreenSet selector in desktop client (react router)
- Improved error-handling in Rust code
- Configuration (journal path)
- Include pre-built SVGs for button shapes
- Nav triggers (open screen on specified journal event)
- Audio/haptic feedback?
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
