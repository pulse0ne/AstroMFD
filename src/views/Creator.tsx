import { ScreenSet } from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";

import Editor from "../editor/Editor.tsx";
import { ScreenSelector } from "../editor/ScreenSelector.tsx";
import { Toolbar } from "../editor/Toolbar.tsx";
import { useECStore } from "../store";

function debounce<T extends (...args: any[]) => any>(
  callback: T,
  waitFor: number,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      callback(...args);
      timeout = null;
    }, waitFor);
  };
}

function update(screenSet: ScreenSet) {
  invoke("update_clients", { screenSet }).catch((e) => console.error(e));
}

const debouncedUpdate = debounce(update, 250);

export function Creator() {
  const { screenSetId } = useParams();
  const screenSet = useECStore((state) => state.screenSet);
  const selectScreenSet = useECStore((state) => state.setActiveScreenSet);
  const dirtyRef = useRef(false);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    invoke<ScreenSet>("get_screen_set_by_id", { id: screenSetId }).then(
      (value) => selectScreenSet(value),
    );
  }, [screenSetId]);

  useEffect(() => {
    if (!screenSet) return;
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    dirtyRef.current = true;
    debouncedUpdate(screenSet);

    const saveTimeout = setTimeout(() => {
      invoke("save_screen_set", { screenSet })
        .then(() => {
          dirtyRef.current = false;
        })
        .catch((e) => console.error(e));
    }, 3000);

    return () => clearTimeout(saveTimeout);
  }, [screenSet]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="creator flex-grow col no-overflow fill-y">
      {!screenSet && (
        <div className="fill row align-items-center justify-content-center">
          <div className="loader"></div>
        </div>
      )}
      {screenSet && (
        <>
          <Toolbar dirtyRef={dirtyRef} />
          <div className="row flex-grow no-overflow fill-y">
            <ScreenSelector />
            <Editor />
          </div>
        </>
      )}
    </div>
  );
}
