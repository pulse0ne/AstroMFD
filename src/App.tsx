import StatusBar from "./statusbar/StatusBar.tsx";
import Editor from "./editor/Editor.tsx";
import {DevicesProvider} from "./hooks/useDevices.tsx";
import {createScreen, Screen, Size} from "./types/widget.ts";
import {useState} from "react";
import {MemoryRouter, Route, Routes, useNavigate} from "react-router";
import {Creator} from "./Creator.tsx";

/*--------------------
  TODO:
- Split out Toolbar, ScreenSelector, and Editor
- Handle deletions of widgets
- Rename screens/screen sets
- Implement AttributesPanel
- Develop out Editor
- Add shadow/glow effects
- Need to add Send Back/Forward (controls widget ordering)
- Global key handler for deleting/nudging/etc.
- Develop Screen selector (react router)
- Persisting/loading Screen Sets
- Client rendering/navigation
- Send updates to clients
- Dynamic Font loading (hook front-end up to it via font loading API)
- Improved error-handling in Rust code
- Startup flow...how to handle Journal Path?
- Undo/Redo
- Duplication of widgets
- Include pre-built SVGs for button shapes
- Support custom images/svgs via folder
- Nav triggers (open screen on specified event)
- Custom images/svgs
- Audio/haptic feedback?
- Screen themes?
- Multiselect?
- README
- Turn ED-specific stuff into "plugin" that can be enabled/disabled
- Explore alternative input methods? virtual keyboard (enigo)?
---------------------*/

function App() {
  // const [ screen, setScreen ] = useState<Screen>(createScreen(1));
  // const [ size, setSize ] = useState<Size>({ width: 1200, height: 800 });

  return (
    <main>
      <DevicesProvider>
        <div className="main-container">
          {/*<Editor*/}
          {/*  screen={screen}*/}
          {/*  onUpdate={setScreen}*/}
          {/*  size={size}*/}
          {/*  onResize={setSize}*/}
          {/*/>*/}
          <MemoryRouter>
            <Routes>
              <Route path="/" element={<Dummy />} />
              <Route path="/creator/:screenSetId" element={<Creator />} />
            </Routes>
          </MemoryRouter>
        </div>
        <StatusBar />
      </DevicesProvider>
    </main>
  );
}

const Dummy = () => {
  const nav = useNavigate();
  return <button onClick={() => nav("/creator/1")}>Creator</button>
};

export default App;
