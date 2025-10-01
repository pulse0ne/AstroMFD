import {RootState} from "./types.ts";

export function activeScreenSelector(state: RootState) {
  const { screenSet, activeScreenIndex } = state;
  if (!screenSet || activeScreenIndex === null) return null;
  return screenSet.screens[activeScreenIndex];
}

export function activeWidgetSelector(state: RootState) {
  const { screenSet, activeScreenIndex, activeWidgetIndex } = state;
  if (!screenSet || activeScreenIndex === null || activeWidgetIndex === null) return null;
  return screenSet.screens[activeScreenIndex].widgets[activeWidgetIndex];
}

export function activeScreenWidgetsSelector(state: RootState) {
  return activeScreenSelector(state)?.widgets;
}

export function hasUndosSelector(state: RootState) {
  if (!state.screenSet || state.activeScreenIndex === null) return false;
  const activeScreenId = state.screenSet.screens[state.activeScreenIndex].id;
  return (state.histories.get(activeScreenId)?.past?.length ?? 0) > 0;
}

export function hasRedosSelector(state: RootState) {
  if (!state.screenSet || state.activeScreenIndex === null) return false;
  const activeScreenId = state.screenSet.screens[state.activeScreenIndex].id;
  return (state.histories.get(activeScreenId)?.future?.length ?? 0) > 0;
}
