// hooks/useMpciRules.js
import { MPCI_RULES } from "../rules/mpciRules.config";

export const useMpciRules = (values = {}, section) => {
  const matchedRules = MPCI_RULES
    .filter((rule) =>
      Object.entries(rule.when || {}).every(
        ([key, expected]) => values[key] === expected
      )
    )
    // Apply generic rules first, then specific rules.
    // Specific rules can override generic show/hide collisions.
    .sort(
      (a, b) =>
        Object.keys(a.when || {}).length - Object.keys(b.when || {}).length
    );

  const result = {
    show: new Set(),
    hide: new Set(),
    disabled: new Set(),
    defaults: {},
  };

  matchedRules.forEach((rule) => {
    const sectionRules = rule.actions?.[section];
    if (!sectionRules) return;

    // Last matching rule wins for the same field.
    sectionRules.hide?.forEach((f) => {
      result.hide.add(f);
      result.show.delete(f);
    });
    sectionRules.show?.forEach((f) => {
      result.show.add(f);
      result.hide.delete(f);
    });
    sectionRules.disabled?.forEach((f) => result.disabled.add(f));
    Object.assign(result.defaults, sectionRules.defaults || {});
  });

  return result;
};
