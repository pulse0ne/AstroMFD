import {useNavigate} from "react-router";
import {CSSProperties, useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {MdAdd, MdDeleteForever, MdEditDocument} from "react-icons/md";

import "./screen-set-selector.css";
import {EditableTitle} from "../editor/EditableTitle.tsx";

const bigText: CSSProperties = {
  fontSize: 24,
  fontWeight: "bold"
};

type ScreenSetMeta = {
  id: string;
  name: string;
};

export function ScreenSetSelector() {
  const [ screenSets, setScreenSets ] = useState<ScreenSetMeta[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    invoke<ScreenSetMeta[]>("list_screen_sets")
      .then(metas => setScreenSets(metas));
  }, []);

  return (
    <div className="no-overflow fill">
      <h1 className="text-center p16 border-b">Screen Sets</h1>
      <div className="scroll-y">
        <div className="screen-set-selector-container gap-24">
          {screenSets.map(ss => (
            <ScreenSetItem
              key={ss.id}
              screenSet={ss}
              onSelect={id => nav(`/creator/${id}`)}
            />
          ))}
          <div className="col align-items-center gap-8 p24">
            <div className="pointer col justify-content-center align-items-center screen-set-add-new-container border">
              <MdAdd size={128} style={{ opacity: 0.7 }} />
            </div>
            <span style={bigText}>New</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type ScreenSetItemProps = {
  screenSet: ScreenSetMeta;
  onSelect: (id: string) => void;
};

function ScreenSetItem({ screenSet, onSelect }: ScreenSetItemProps) {
  const [ isHovered, setIsHovered ] = useState(false);
  return (
    <div
      className="col align-items-center gap-8 p24"
    >
      <div
        className="screen-set-img-container border relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* TODO: img */}
        {isHovered && (
          <div
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, backdropFilter: "blur(3px)" }}
            className="row justify-content-space-around p16-b"
          >
            <MdEditDocument
              onClick={() => onSelect(screenSet.id)}
              className="pointer"
              color="rgba(255, 255, 255, 0.8)"
              size={64}
            />
            <MdDeleteForever
              className="pointer"
              color="rgba(255, 0, 0, 0.8)"
              size={64}
            />
          </div>
        )}
      </div>
      <EditableTitle
        className="text-center"
        style={bigText}
        inputStyle={{ textAlign: "center", ...bigText }}
        value={screenSet.name} onChange={console.log}
      />
    </div>
  );
}
