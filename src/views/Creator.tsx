import {Toolbar} from "../editor/Toolbar.tsx";
import {useParams} from "react-router";
import {useEffect} from "react";
import {invoke} from "@tauri-apps/api/core";
import {useECStore} from "../store";
import Editor from "../editor/Editor.tsx";
import {ScreenSelector} from "../editor/ScreenSelector.tsx";
import {ScreenSet} from "@common/shared/models";

function debounce <T extends (...args: any[]) => any>(
  callback: T,
  waitFor: number
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      callback(...args);
      timeout = null; // Clear timeout after execution
    }, waitFor);
  };
}

function update(screenSet: ScreenSet) {
  invoke("update_clients", { screenSet })
    .catch(e => console.error(e));
}

function save(screenSet: ScreenSet) {
  invoke("save_screen_set", { screenSet })
    .catch(e => console.error(e));
}

const debouncedUpdate = debounce(update, 250);
const debouncedSave = debounce(save, 5000);

export function Creator() {
  const { screenSetId } = useParams();
  const screenSet = useECStore(state => state.screenSet);
  const selectScreenSet = useECStore(state => state.setActiveScreenSet);

  useEffect(() => {
    invoke<ScreenSet>("get_screen_set_by_id", { id: screenSetId })
      .then(value => selectScreenSet(value)); // TODO: error handling
  }, [screenSetId]);

  useEffect(() => {
    if (screenSet) {
      debouncedUpdate(screenSet);
      debouncedSave(screenSet);
    }
  }, [screenSet]);

  return (
    <div className="creator flex-grow col no-overflow">
      {!screenSet && (
        <div className="fill row align-items-center justify-content-center">
          <div className="loader"></div>
        </div>
      )}
      {screenSet && (
        <>
          <Toolbar />
          <div className="row flex-grow no-overflow">
            <ScreenSelector />
            <Editor />
          </div>
        </>
      )}
    </div>
  );
}
