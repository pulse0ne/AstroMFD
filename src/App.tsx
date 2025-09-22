import StatusBar from "./statusbar/StatusBar.tsx";
import Editor from "./editor/Editor.tsx";
import {DevicesProvider} from "./hooks/useDevices.tsx";

/*--------------------
  TODO:
- Implement AttributesPanel
- Implement Panel
- Implement Label
- Develop out Editor
- Need to add Send Back/Forward (controls widget ordering)
- Global key handler for deleting/nudging/etc.
- Develop Screen selector
- Persisting/loading Screen Sets
- Label and Panel editor implementations
- Client rendering/navigation
- Send updates to clients
- Dynamic Font loading (hook front-end up to it via font loading API)
- Improved error-handling in Rust code
- Undo/Redo
- Duplication
- Sync viewport size button (when clients are attached)
- Nav triggers (open screen on specified event)
- Custom images/svgs
- Audio/haptic feedback?
- Better UI theme
- Pane themes?
- Multiselect?
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
