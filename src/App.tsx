import StatusBar from "./statusbar/StatusBar.tsx";
import {DevicesProvider} from "./hooks/useDevices.tsx";
import {MemoryRouter, Route, Routes, useNavigate} from "react-router";
import {Creator} from "./Creator.tsx";

/*--------------------
  TODO:
- Fix undo/redo weirdness
- Fix ghost client problem
- Undo/Redo (screen/screenSet commands)
- Duplication of widgets (hook functions up to store & controls)
- Deletion of screens
- Renaming of screens/screen sets
- Pressed state for buttons
- Add shadow/glow effects to shapes/text
- Develop ScreenSet selector (react router)
- Persisting/loading ScreenSets
- Client rendering/navigation
- Send updates to mobile clients
- Dynamic Font loading (hook mobile UI up to it via font loading API)
- Improved error-handling in Rust code
- Startup flow...how to handle Journal Path? other config?
- Include pre-built SVGs for button shapes
- Nav triggers (open screen on specified journal event)
- Support custom images/svgs via folder (or "upload"?)
- Audio/haptic feedback?
- Color themes?
- Multiselect?
- README
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
