import { ScreenSet } from "@common/shared/models";

export type ValidationIssue = {
  level: "error" | "warning";
  screen: string;
  message: string;
};

export type ScreenSetValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export function validateScreenSet(s: ScreenSet): ScreenSetValidationResult {
  const issues: ValidationIssue[] = [];

  const screenIds = s.screens.map((screen) => screen.id);
  const screenIdToName = s.screens.reduce(
    (acc, item) => {
      acc[item.id] = item.name;
      return acc;
    },
    {} as Record<string, string>,
  );

  // Duplicate screen IDs
  const seenScreenIds = new Set<string>();
  for (const screen of s.screens) {
    if (seenScreenIds.has(screen.id)) {
      issues.push({ level: "error", screen: screen.name, message: "Duplicate screen ID detected." });
    }
    seenScreenIds.add(screen.id);
  }

  // Per-screen checks
  const screenIdsWithNavRoute = new Set<string>();

  for (const screen of s.screens) {
    // Empty screen warning
    if (screen.widgets.length === 0) {
      issues.push({ level: "warning", screen: screen.name, message: "Screen has no widgets." });
    }

    // Duplicate widget IDs within a screen
    const seenWidgetIds = new Set<string>();
    for (const w of screen.widgets) {
      if (seenWidgetIds.has(w.id)) {
        issues.push({ level: "error", screen: screen.name, message: `Duplicate widget ID "${w.id}".` });
      }
      seenWidgetIds.add(w.id);

      // Widget bounds check
      const pos = w.shape.position;
      const size = w.shape.size;
      if (pos.x + size.width < 0 || pos.y + size.height < 0 || pos.x > s.size.width || pos.y > s.size.height) {
        issues.push({ level: "warning", screen: screen.name, message: `Widget "${w.type}" is completely off-canvas.` });
      }

      // Button-specific checks
      if (w.type === "button") {
        if (w.buttonType === "action" && w.input.steps.length === 0) {
          issues.push({ level: "warning", screen: screen.name, message: `Action button "${w.text.text || w.id}" has no actions configured.` });
        }

        if (w.buttonType === "navigation") {
          if (!w.navTarget) {
            issues.push({ level: "warning", screen: screen.name, message: `Nav button "${w.text.text || w.id}" has no target screen set.` });
          } else if (!screenIds.includes(w.navTarget)) {
            issues.push({ level: "error", screen: screen.name, message: `Nav button "${w.text.text || w.id}" points to a non-existent screen.` });
          } else {
            screenIdsWithNavRoute.add(w.navTarget);
          }
        }
      }
    }
  }

  // Unreachable screens (only relevant with multiple screens)
  if (s.screens.length > 1) {
    for (const screen of s.screens) {
      if (!screenIdsWithNavRoute.has(screen.id)) {
        issues.push({ level: "warning", screen: screen.name, message: `No nav route leads to this screen.` });
      }
    }
  }

  const hasErrors = issues.some((i) => i.level === "error");
  return { valid: !hasErrors, issues };
}
