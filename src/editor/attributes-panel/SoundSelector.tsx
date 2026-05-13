import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ButtonSound } from "@common/shared/models";

type AudioEntry = {
  source: string;
  file: string;
};

export type SoundSelectorProps = {
  value: ButtonSound;
  onChange: (sound: ButtonSound) => void;
};

export function SoundSelector({ value, onChange }: SoundSelectorProps) {
  const [audioClips, setAudioClips] = useState<AudioEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    invoke<AudioEntry[]>("get_audio_clips")
      .then((clips) => {
        setAudioClips(clips);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch audio clips:", error);
        setIsLoading(false);
      });
  }, []);

  const handleSoundChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = evt.target.value;
    if (selectedValue === "") {
      onChange(null);
    } else {
      const [source, file] = selectedValue.split(":");
      onChange({
        source,
        file,
        playOn: value?.playOn || "mobile",
      });
    }
  };

  const handlePlayOnChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    if (value) {
      onChange({
        ...value,
        playOn: evt.target.value as "mobile" | "desktop" | "both",
      });
    }
  };

  const selectedValue = value ? `${value.source}:${value.file}` : "";

  return (
    <div className="col gap-16">
      <div className="row gap-16 align-items-center">
        <span>Sound:</span>
        <select
          value={selectedValue}
          onChange={handleSoundChange}
          disabled={isLoading}
        >
          <option value="">None</option>
          {audioClips.map((clip) => (
            <option
              key={`${clip.source}:${clip.file}`}
              value={`${clip.source}:${clip.file}`}
            >
              {clip.file.replace(/\.(mp3|wav|ogg)$/i, "")} ({clip.source})
            </option>
          ))}
        </select>
      </div>
      {value && (
        <div className="row gap-16 align-items-center">
          <span>Play On:</span>
          <select value={value.playOn} onChange={handlePlayOnChange}>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="both">Both</option>
          </select>
        </div>
      )}
    </div>
  );
}
