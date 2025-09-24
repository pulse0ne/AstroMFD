import StatusBar from "./statusbar/StatusBar.tsx";
import Editor from "./editor/Editor.tsx";
import {DevicesProvider} from "./hooks/useDevices.tsx";

/*--------------------
  TODO:
- Implement AttributesPanel
- Develop out Editor
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
- Alternative input methods? virtual keyboard (enigo)?
---------------------*/

function App() {
  return (
    <main>
      <DevicesProvider>
        <div className="main-container">
          <Editor />
        </div>
        <StatusBar />
      </DevicesProvider>
    </main>
  );
}

export default App;
