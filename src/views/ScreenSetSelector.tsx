import {useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {MdAdd} from "react-icons/md";

import "./screen-set-selector.css";

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
    <div className="scroll-y">
      <div className="screen-set-selector-container gap-24">
        {screenSets.map(ss => (
          <ScreenSetItem
            key={ss.id}
            screenSet={ss}
            onSelect={id => nav(`/creator/${id}`)}
          />
        ))}
        <div className="pointer col align-items-center gap-8 p24">
          <div className="col justify-content-center align-items-center screen-set-add-new-container border">
            <MdAdd size={128} style={{ opacity: 0.7 }} />
          </div>
          <h3>New</h3>
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
  return (
    <div
      className="pointer col align-items-center gap-8 p24"
      onClick={() => onSelect(screenSet.id)}
    >
      <div className="screen-set-img-container border">
        {/* TODO: img */}
      </div>
      <h3 className="text-center">{screenSet.name}</h3>
    </div>
  );
}
