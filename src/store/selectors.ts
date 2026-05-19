import { CarouselAttributes, PanelAttributes, Screen, Widget } from "@common/shared/models";

import { RootState } from "./types.ts";

export function activeScreenSelector(state: RootState) {
  const { screenSet, activeScreenIndex } = state;
  if (!screenSet || activeScreenIndex === null) return null;
  return screenSet.screens[activeScreenIndex];
}

export function activeWidgetListSelector(state: RootState): Widget[] | null {
  const screen = activeScreenSelector(state);
  if (!screen) return null;
  if (state.editingContainerId) {
    const carousel = screen.widgets.find(
      (w) => w.id === state.editingContainerId,
    ) as CarouselAttributes | undefined;
    if (!carousel) return null;
    return carousel.pages[carousel.activePageIndex]?.widgets ?? null;
  }
  return screen.widgets;
}

export function activeWidgetSelector(state: RootState) {
  const { activeWidgetIndex } = state;
  if (activeWidgetIndex === null) return null;
  const widgets = activeWidgetListSelector(state);
  if (!widgets) return null;
  return widgets[activeWidgetIndex] ?? null;
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

export function screensSelector(state: RootState) {
  if (!state.screenSet) return [] as Screen[];
  return state.screenSet.screens;
}

export function editingContainerSelector(state: RootState): CarouselAttributes | PanelAttributes | null {
  if (!state.editingContainerId) return null;
  const screen = activeScreenSelector(state);
  if (!screen) return null;
  const widget = screen.widgets.find((w) => w.id === state.editingContainerId);
  if (!widget) return null;
  if (widget.type === "carousel" || widget.type === "panel") return widget;
  return null;
}
