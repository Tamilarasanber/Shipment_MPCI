// Editable review model for the HBL PDF extraction popup.
//
// The extract-from-pdf API returns `reviewData` where master-bound fields use a
// { value, master } wrapper. This helper flattens that into a form-friendly,
// editable model (kept per file in the pdfExtraction Redux slice). We intentionally
// do NOT map to the Formik hblList shape here — that conversion belongs to the
// future post-validate "populate HBL" step (out of scope).

export const MASTER_STATUS = {
  MATCHED: "MATCHED",
  UNMATCHED: "UNMATCHED",
  SKIPPED: "SKIPPED",
  AMBIGUOUS: "AMBIGUOUS",
};

// Configuration for master-bound review fields: which master API to search and
// which Redux option list to read. Keyed by "<section-singular>.<field>".
// Reuses the exact same master types/keys the HBL form tabs already use.
export const MASTER_FIELD_CONFIG = {
  "generalInfo.portOfAcceptance": {
    type: "PORTNAME",
    section: "generalInfoDetails",
    targetField: "portOfAcceptanceList",
    labelKey: "portName",
  },
  "generalInfo.endDestination": {
    type: "PORTNAME",
    section: "generalInfoDetails",
    targetField: "endDestinationList",
    labelKey: "portName",
  },
  "generalInfo.portOfLoading": {
    type: "PORTNAME",
    section: "generalInfoDetails",
    targetField: "portOfLoadingList",
    labelKey: "portName",
  },
  "generalInfo.portOfDischarge": {
    type: "PORTNAME",
    section: "generalInfoDetails",
    targetField: "portOfDischargeList",
    labelKey: "portName",
  },
  "parties.countryName": {
    type: "COUNTRY",
    section: "partiesDetails",
    targetField: "countryList",
    labelKey: "countryName",
  },
  "containers.containerCode": {
    type: "CONTAINER",
    section: "containerDetails",
    targetField: "containerCodeList",
    labelKey: "containerCode",
  },
  "items.packageTypeName": {
    type: "PACKAGE_TYPE",
    section: "itemDetails",
    targetField: "packageTypeList",
    labelKey: "name",
  },
};

const isMasterWrapper = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.prototype.hasOwnProperty.call(value, "master");

// PDF extraction often returns multi-line text; filing validation allows no \r/\n.
export const stripLineBreaks = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/\r\n/g, " ")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s{2,}/g, " ")
    // .trim();
};

const sanitizeReviewString = (value) => {
  if (value == null || typeof value !== "string") return value ?? "";
  return stripLineBreaks(value);
};

// Flattens a { value, master } wrapper into an editable master field.
const normalizeMasterField = (wrapper) => {
  const master = wrapper?.master || {};
  return {
    value: sanitizeReviewString(wrapper?.value ?? ""),
    id: master?.matched?.id ?? "",
    status: master?.status ?? null,
    extracted:
      master?.extracted == null
        ? null
        : sanitizeReviewString(String(master.extracted)),
    displayLabel:
      master?.displayLabel == null
        ? null
        : sanitizeReviewString(String(master.displayLabel)),
    matched: master?.matched ?? null,
  };
};

// Recursively normalizes any reviewData node into the editable model shape.
const normalizeNode = (node) => {
  if (Array.isArray(node)) {
    return node.map(normalizeNode);
  }
  if (isMasterWrapper(node)) {
    return normalizeMasterField(node);
  }
  if (node !== null && typeof node === "object") {
    return Object.keys(node).reduce((acc, key) => {
      acc[key] = normalizeNode(node[key]);
      return acc;
    }, {});
  }
  if (typeof node === "string") {
    return sanitizeReviewString(node);
  }
  return node;
};

// Builds the editable review model from a file's reviewData payload.
export const buildReviewModel = (reviewData) => {
  const source = reviewData || {};
  const generalInfo = normalizeNode(source.generalInfo || {});
  return {
    // splitBl / originalNo are UI-only (not extracted); seed HBL-form defaults.
    generalInfo: {
      ...generalInfo,
      splitBl: generalInfo.splitBl ?? "No",
      originalNo: generalInfo.originalNo ?? "",
    },
    parties: normalizeNode(Array.isArray(source.parties) ? source.parties : []),
    containers: normalizeNode(
      Array.isArray(source.containers) ? source.containers : [],
    ),
    items: normalizeNode(Array.isArray(source.items) ? source.items : []),
  };
};

// Immutable set-by-path. `path` is an array of keys; numeric-string keys index
// into arrays. Returns a new object graph with the value applied.
export const setByPath = (target, path, value) => {
  if (!Array.isArray(path) || !path.length) return target;

  const [head, ...rest] = path;
  const key = head;

  if (Array.isArray(target)) {
    const index = Number(key);
    const next = [...target];
    next[index] = rest.length
      ? setByPath(next[index] ?? {}, rest, value)
      : value;
    return next;
  }

  const next = { ...(target || {}) };
  next[key] = rest.length ? setByPath(next[key] ?? {}, rest, value) : value;
  return next;
};

const hasMasterValue = (field) => Boolean(String(field?.value ?? "").trim());

// True when the field value is resolved against the master table (green cue).
export const isMasterInSync = (field) =>
  Boolean(field) &&
  field.status === MASTER_STATUS.MATCHED &&
  Boolean(field.matched) &&
  hasMasterValue(field);

export const isMatchedMaster = isMasterInSync;

// True when a master field should show the attention cue (amber icon).
export const masterNeedsAttention = (field, { isMandatory = false } = {}) => {
  if (!field || isMasterInSync(field)) return false;
  if (hasMasterValue(field)) return true;
  return Boolean(isMandatory);
};

// Back-compat alias used by older call sites.
export const isUnmatchedMaster = (field) =>
  masterNeedsAttention(field, { isMandatory: false }) && hasMasterValue(field);

// Resolves the label shown in master-bound autocomplete controls.
export const resolveMasterOptionDisplayLabel = (
  option,
  labelKey = "label",
) =>
  sanitizeReviewString(
    option?.displayLabel || option?.note || option?.[labelKey] || "",
  );

// Builds a full master field object after the user selects from the picker.
export const buildSelectedMasterField = (option, labelKey = "label") => {
  if (!option) {
    return buildClearedMasterField();
  }

  const canonicalValue = sanitizeReviewString(option?.[labelKey] || "");
  const displayValue = resolveMasterOptionDisplayLabel(option, labelKey);
  return {
    value: canonicalValue,
    id: option?.id ?? "",
    status: MASTER_STATUS.MATCHED,
    extracted: displayValue,
    displayLabel: displayValue,
    matched: option,
  };
};

// Resets a master field when the user clears the picker.
export const buildClearedMasterField = (prev = {}) => ({
  value: "",
  id: "",
  status: prev?.status === MASTER_STATUS.SKIPPED ? MASTER_STATUS.SKIPPED : null,
  extracted: prev?.extracted ?? null,
  displayLabel: null,
  matched: null,
});

// Builds a single autocomplete option from backend master resolution so the
// review UI can display MATCHED fields without calling the master API.
export const buildMasterSeedOption = (field, labelKey = "label") => {
  if (!isMasterInSync(field)) return null;

  const row = field.matched;
  const backendDisplayLabel = sanitizeReviewString(field.displayLabel || "");
  const portName = sanitizeReviewString(row?.portName || "");
  const portCode = sanitizeReviewString(row?.portCode || "");
  const composedPortLabel =
    portName && portCode ? `${portName} (${portCode})` : "";

  return {
    ...row,
    displayLabel:
      backendDisplayLabel ||
      composedPortLabel ||
      resolveMasterOptionDisplayLabel(row, labelKey) ||
      sanitizeReviewString(field.value || ""),
  };
};
