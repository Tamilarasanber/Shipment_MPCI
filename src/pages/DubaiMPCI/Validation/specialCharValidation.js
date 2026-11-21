import * as Yup from "yup";

export const ALLOWED_SPECIAL_CHARS_REGEX =
  /^[A-Za-z0-9 \r\n,+\-$#@%&!'`^_:;.?\[\]{}\/='|]*$/;  

const ALLOWED_CHAR =
  // /^[A-Za-z0-9 ,+\-$#@%&!'`^_:;.?\[\]{}\/='|]$/;
  /^[A-Za-z0-9 \r\n,+\-$#@%&!'`^_:;.?\[\]{}\/='|]*$/; 

export const findDisallowedChars = (value) => {
  const text = String(value);
  const seen = new Set();
  const invalid = [];

  for (const ch of text) {
    if (!ALLOWED_CHAR.test(ch) && !seen.has(ch)) {
      seen.add(ch);
      invalid.push(ch);
    }
  }

  return invalid;
};

export const formatCharForDisplay = (ch) => {
  switch (ch) {
    case "\n":
      return "line break";
    case "\r":
      return "carriage return";
    case "\t":
      return "tab";
    default:
      return ch;
  }
};

export const formatInvalidCharsMessage = (chars, maxDisplay = 5) => {
  if (!chars.length) return "Invalid character(s) found";

  const visible = chars.slice(0, maxDisplay).map((ch) => {
    const label = formatCharForDisplay(ch);
    return label.length === 1 ? `${label}` : label;
  });

  const remainder =
    chars.length > maxDisplay ? ` and ${chars.length - maxDisplay} more` : "";

  // return `These characters are not allowed: ${visible.join(", ")}${remainder}`;
  return `These characters are not allowed: ${visible.join(" ")}${remainder}`;
};

export const specialCharValidation = (fieldLabel) =>
  Yup.string().test(
    `${fieldLabel}-special-char-validation`,
    function (value) {
      if (!value) return true;

      const bad = findDisallowedChars(value);
      if (!bad.length) return true;

      return this.createError({
        message: formatInvalidCharsMessage(bad),
      });
    },
  );

export const withAllowedSpecialChars = (schema, fieldLabel = "field") =>
  schema.concat(specialCharValidation(fieldLabel));
