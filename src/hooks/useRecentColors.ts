import {useCallback, useState} from "react";

const initialColors: string[] = [];
for (let i = 0; i < 10; i++) {
  initialColors.push("rgba(255, 255, 255, 1.0)");
}
export function useRecentColors() {
  const [recents, setRecents] = useState(initialColors);

  const addRecentColor = useCallback((color: string) => {
    setRecents(ov => {
      if (ov.includes(color)) return ov;
      const r = [color, ...ov];
      r.pop();
      return r;
    });
  }, []);

  return { recentColors: recents, addRecentColor };
}