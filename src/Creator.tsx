import {Toolbar} from "./editor/Toolbar.tsx";
import {findNextAvailableButton, ScreenSet, Size, Widget} from "./types/widget.ts";
import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {MdArrowBackIos} from "react-icons/md";

export function Creator() {
  const { screenSetId } = useParams();
  const navigate = useNavigate();
  const [ screenSet, setScreenSet ] = useState<ScreenSet|null>(null);
  const [ selectedScreenIndex, setSelectedScreenIndex ] = useState<number|null>(null);

  useEffect(() => {
    invoke<ScreenSet>("get_screen_set_by_id", { id: screenSetId })
      .then(value => setScreenSet(value))
      .then(() => {
        if (screenSet?.screens?.length) {
          setSelectedScreenIndex(0);
        }
      }); // TODO: error handling
  }, [screenSetId]);

  useEffect(() => {
    // TODO: auto-save after timeout
  }, [screenSet]);

  const handleWidgetAdded = (widget: Widget) => {
    if (!screenSet || !selectedScreenIndex) return;
    const screen = screenSet.screens[selectedScreenIndex];
    const widgets = screen.widgets;
    if (widget.type === "button") {
      widget.vjoyButton.button = findNextAvailableButton(widgets);
    }
    const newWidgets = [...widgets, widget];
    // onUpdate({ ...screen, widgets: newWidgets });
    setScreenSet(ov => {
      const rval: ScreenSet = { ...ov! };
      rval.screens[selectedScreenIndex].widgets = newWidgets;
      return rval;
    });

    // // TODO: revisit this hack
    // setTimeout(() => {
    //   setSelectedWidgetIndex(newWidgets.length - 1);
    // }, 0);
  };

  const handleScreenAdded = () => {
    // TODO
  };

  const handleDimensionsChange = (size: Size) => {
    setScreenSet(ov => {
      return { ...ov!, size };
    });
  };

  console.log("render");
  return (
    <div className="creator fill">
      {!screenSet && <div className="fill row align-center justify-center"><div className="loader"></div></div>}
      {screenSet && (
        <>
          <Toolbar
            dimensions={screenSet.size}
            onAddWidget={handleWidgetAdded}
            onAddScreen={handleScreenAdded}
            onDimensionsChange={handleDimensionsChange}
          />
          <button onClick={() => navigate("/")}><MdArrowBackIos /></button>
        </>
      )}
    </div>
  );
}