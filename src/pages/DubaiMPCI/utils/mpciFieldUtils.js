export const isVisible = (field, rules, defaultVisible = true) => {
  // 1️⃣ Explicit hide always wins
  if (rules?.hide?.has(field)) return false;

  // 2️⃣ Explicit show
  if (rules?.show?.has(field)) return true;

  // 3️⃣ Otherwise, default visibility
  return defaultVisible;
};

export const isDisabled = (field, rules) =>
  rules?.disabled?.has(field);