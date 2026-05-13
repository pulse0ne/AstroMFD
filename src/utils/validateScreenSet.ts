import { ScreenSet } from "@common/shared/models";

export type ScreenSetValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateScreenSet(s: ScreenSet): ScreenSetValidationResult {
  const errors: string[] = [];

  if (s.screens.length > 1) {
    const screenIdToName = s.screens.reduce(
      (acc, item) => {
        acc[item.id] = item.name;
        return acc;
      },
      {} as Record<string, string>,
    );
    const screenIds = s.screens.map((screen) => screen.id);
    const screenIdsWithoutNavRoute = [...screenIds];
    s.screens.forEach((screen) => {
      // TODO: when we add triggers, we can remove the screen since the trigger is considered a route
      screen.widgets.forEach((w) => {
        if (w.type === "button" && w.navTarget) {
          if (!screenIds.includes(w.navTarget)) {
            errors.push(
              `Nav button in ${screen.name} points to a non-existent target.`,
            );
          }
          const index = screenIdsWithoutNavRoute.indexOf(w.navTarget);
          if (index > -1) {
            screenIdsWithoutNavRoute.splice(index, 1);
          }
        }
      });
    });
    screenIdsWithoutNavRoute.forEach((id) => {
      const screenName = screenIdToName[id];
      errors.push(`Screen "${screenName}" does not have a nav route to it.`);
    });
  }

  return { valid: errors.length === 0, errors };
}
