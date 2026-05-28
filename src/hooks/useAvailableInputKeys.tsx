import { InputKey } from "@common/shared/models";
import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type AvailableInputKeysContextValue = {
  availableKeys: InputKey[];
  defaultKey: InputKey;
  isLoading: boolean;
};

const DEFAULT_FALLBACK_KEY: InputKey = {
  type: "joystickButton",
  button: 1,
};

const AvailableInputKeysContext = createContext<AvailableInputKeysContextValue>(
  {
    availableKeys: [],
    defaultKey: DEFAULT_FALLBACK_KEY,
    isLoading: true,
  },
);

export function AvailableInputKeysProvider({
  children,
}: PropsWithChildren<{}>) {
  const [state, setState] = useState<AvailableInputKeysContextValue>({
    availableKeys: [],
    defaultKey: DEFAULT_FALLBACK_KEY,
    isLoading: true,
  });

  useEffect(() => {
    invoke<InputKey[]>("get_available_input_keys")
      .then((keys) => {
        setState({
          availableKeys: keys,
          defaultKey: keys[0] || DEFAULT_FALLBACK_KEY,
          isLoading: false,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch available input keys:", error);
        setState({
          availableKeys: [DEFAULT_FALLBACK_KEY],
          defaultKey: DEFAULT_FALLBACK_KEY,
          isLoading: false,
        });
      });
  }, []);

  return (
    <AvailableInputKeysContext.Provider value={state}>
      {children}
    </AvailableInputKeysContext.Provider>
  );
}

export function useAvailableInputKeys() {
  const ctx = useContext(AvailableInputKeysContext);
  if (!ctx) {
    throw new Error(
      "useAvailableInputKeys must be used inside AvailableInputKeysProvider",
    );
  }
  return ctx;
}
