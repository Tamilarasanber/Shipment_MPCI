import { AMENDMENT_TYPE_BY_ACTION } from "../rules/amendmentType.rules";
// amendmentType.utils.js
export const getAmendmentTypeOptions = (
  actionCode,
  allOptions,
) => {
  if (!actionCode) return [];

  const rule = AMENDMENT_TYPE_BY_ACTION[actionCode];
  if (!rule) return allOptions;

  return allOptions.filter((opt) =>
    rule.allow.includes(opt.value),
  );
};