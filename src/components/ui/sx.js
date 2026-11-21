const SPACE_KEYS = {
  p: ["padding"],
  px: ["paddingLeft", "paddingRight"],
  py: ["paddingTop", "paddingBottom"],
  pt: ["paddingTop"],
  pr: ["paddingRight"],
  pb: ["paddingBottom"],
  pl: ["paddingLeft"],
  m: ["margin"],
  mx: ["marginLeft", "marginRight"],
  my: ["marginTop", "marginBottom"],
  mt: ["marginTop"],
  mr: ["marginRight"],
  mb: ["marginBottom"],
  ml: ["marginLeft"],
  gap: ["gap"],
};

const DIRECT_KEYS = {
  display: "display",
  flexDirection: "flexDirection",
  alignItems: "alignItems",
  justifyContent: "justifyContent",
  flexWrap: "flexWrap",
  flex: "flex",
  flexGrow: "flexGrow",
  width: "width",
  height: "height",
  minHeight: "minHeight",
  maxHeight: "maxHeight",
  minWidth: "minWidth",
  maxWidth: "maxWidth",
  position: "position",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  zIndex: "zIndex",
  overflow: "overflow",
  overflowX: "overflowX",
  overflowY: "overflowY",
  textAlign: "textAlign",
  fontWeight: "fontWeight",
  fontSize: "fontSize",
  lineHeight: "lineHeight",
  color: "color",
  background: "background",
  backgroundColor: "backgroundColor",
  bgcolor: "backgroundColor",
  border: "border",
  borderRadius: "borderRadius",
  borderBottom: "borderBottom",
  borderTop: "borderTop",
  borderColor: "borderColor",
  boxShadow: "boxShadow",
  cursor: "cursor",
  opacity: "opacity",
  whiteSpace: "whiteSpace",
  textTransform: "textTransform",
  gridTemplateColumns: "gridTemplateColumns",
  alignSelf: "alignSelf",
  textOverflow: "textOverflow",
};

const spacing = (value) => (typeof value === "number" ? `${value * 8}px` : value);

export function sxToStyle(sx) {
  if (!sx) return {};
  const items = Array.isArray(sx) ? sx : [sx];
  const style = {};

  items.forEach((item) => {
    if (!item || typeof item !== "object") return;
    Object.entries(item).forEach(([key, value]) => {
      if (value == null || key.startsWith("&") || key.startsWith("@")) return;
      if (typeof value === "object") return;
      if (SPACE_KEYS[key]) {
        SPACE_KEYS[key].forEach((styleKey) => {
          style[styleKey] = spacing(value);
        });
        return;
      }
      if (DIRECT_KEYS[key]) {
        style[DIRECT_KEYS[key]] =
          key === "borderRadius" && typeof value === "number"
            ? `${value}px`
            : value;
      }
    });
  });

  return style;
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
