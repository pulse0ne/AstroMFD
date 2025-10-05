import {Toolbar} from "./editor/Toolbar.tsx";
import {ScreenSet} from "./types/widget.ts";
import {useParams} from "react-router";
import {useEffect} from "react";
import {invoke} from "@tauri-apps/api/core";
import {useECStore} from "./store";
import Editor from "./editor/Editor.tsx";
import {ScreenSelector} from "./editor/ScreenSelector.tsx";

export function Creator() {
  const { screenSetId } = useParams();
  const screenSet = useECStore(state => state.screenSet);
  const selectScreenSet = useECStore(state => state.setActiveScreenSet);

  useEffect(() => {
    invoke<ScreenSet>("get_screen_set_by_id", { id: screenSetId })
      .then(value => selectScreenSet(value)); // TODO: error handling
  }, [screenSetId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("changed...need to save");
      invoke("save_screen_set", { screenSet })
        .catch(e => console.error(e));
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [screenSet]);

  // console.log("render Creator");
  console.log(screenSet);

  return (
    <div className="creator flex-grow col">
      {!screenSet && (
        <div className="fill row align-center justify-center">
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
