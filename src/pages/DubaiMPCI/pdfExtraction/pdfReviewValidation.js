import * as Yup from "yup";
import {
  generalInfoDetails,
} from "../Validation/generalInfoDetails.schema";
import { specialCharValidation } from "../Validation/specialCharValidation";
import { buildPartyDetailsSchema } from "../Validation/partiesDetails.schema";
import { buildContainerDetailsSchema } from "../Validation/containerDetails.schema";
import { buildItemDetailsSchema } from "../Validation/itemDetails.schema";
import { PDF_REVIEW_GENERAL_INFO_KEYS, PDF_REVIEW_REQUIRED_FIELD_KEYS } from "./pdfReviewFieldScope";
import { isMasterInSync } from "./reviewModel";

const MASTER_SYNC_ERROR = "Select a value from the master list";

const hasText = (value) => Boolean(String(value ?? "").trim());

const isMasterFieldObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.prototype.hasOwnProperty.call(value, "status");

const flattenScalar = (value) => {
  if (isMasterFieldObject(value)) {
    return value.value ?? "";
  }
  if (value === null || value === undefined) return "";
  return value;
};

const pathKey = (segments) => segments.join(".");

const normalizeYupPath = (yupPath = "") =>
  String(yupPath).replace(/\[(\d+)\]/g, ".$1");

const yupPathToReviewKey = (yupPath = "") => normalizeYupPath(yupPath);

export const REVIEW_FIELD_LABELS = {
  "generalInfo.hblNo": "HBL Number",
  "generalInfo.movementType": "Movement Type",
  "generalInfo.blType": "BL Type",
  "generalInfo.cargoType": "Cargo Type",
  "generalInfo.portOfAcceptance": "Port Of Acceptance",
  "generalInfo.portOfLoading": "Port Of Loading",
  "generalInfo.portOfDischarge": "Port Of Discharge",
  "generalInfo.endDestination": "Port Of End Destination",
  "generalInfo.originalNo": "Original BL Number",
  // "generalInfo.filingPartyMpciID": "Filing Party MPCI ID",
  "generalInfo.parentBlNumber": "Parent BL Number",
  "generalInfo.parentBlIssuerPartyName": "Parent BL Issuing Party Name",
  "generalInfo.parentBlIssuerPartyMpciId": "Parent BL Party MPCI ID",
  "generalInfo.liablePartyMpciId": "Liable UAE Party MPCI ID",
  "generalInfo.futureChildBl": "Further Child BL",
  "generalInfo.portOfTranshipment": "Port of Transhipment",
  "parties.partyName": "Entity Name",
  "parties.address": "Address",
  "parties.cityName": "City",
  "parties.countryName": "Country",
  "containers.containerCode": "Container Code",
  "containers.containerNo": "Container No",
  "containers.containerStatus": "Container Status",
  "containers.carrierSeal": "Carrier Seal",
  "containers.temperature": "Temperature",
  "containers.unitCode": "Temperature Unit",
  "items.containerNo": "Container No",
  "items.numberOfPackages": "No. of Packages",
  "items.packageTypeName": "Package Type",
  "items.cargoGrossWeight": "Cargo Gross Weight (KGM)",
  "items.itemDescription": "Item Description",
  "items.marksAndNumbers": "Marks & Numbers",
  "items.hsCode": "HS Code",
  "items.unCode": "UN Code",
  "items.imoClass": "IMO Class",
};

const labelForPath = (reviewKey) => {
  if (REVIEW_FIELD_LABELS[reviewKey]) return REVIEW_FIELD_LABELS[reviewKey];

  const segments = reviewKey.split(".");
  if (segments.length >= 3 && !Number.isNaN(Number(segments[segments.length - 2]))) {
    const fieldKey = `${segments[0]}.${segments[segments.length - 1]}`;
    if (REVIEW_FIELD_LABELS[fieldKey]) return REVIEW_FIELD_LABELS[fieldKey];
  }

  const tailKey = segments.slice(-2).join(".");
  return REVIEW_FIELD_LABELS[tailKey] || reviewKey;
};

const labelForIndexedPath = (reviewKey, editedData) => {
  const partyMatch = reviewKey.match(/^parties\.(\d+)\.(\w+)$/);
  if (partyMatch) {
    const index = Number(partyMatch[1]);
    const party = editedData?.parties?.[index];
    return `${party?.partyType || `Party ${index + 1}`} — ${labelForPath(`parties.${partyMatch[2]}`)}`;
  }

  const containerMatch = reviewKey.match(/^containers\.(\d+)\.(\w+)$/);
  if (containerMatch) {
    const index = Number(containerMatch[1]);
    return `Container ${index + 1} — ${labelForPath(`containers.${containerMatch[2]}`)}`;
  }

  const itemMatch = reviewKey.match(/^items\.(\d+)\.(\w+)$/);
  if (itemMatch) {
    const index = Number(itemMatch[1]);
    return `Item ${index + 1} — ${labelForPath(`items.${itemMatch[2]}`)}`;
  }

  return labelForPath(reviewKey);
};

const looksLikeDevPath = (text) =>
  /^(generalInfo|parties|containers|items)(\.\d+)?\.\w+/.test(String(text));

// Derive a user-facing field label from the Yup validation message when path lookup fails.
const schemaMessageToLabel = (message = "") => {
  const trimmed = String(message).trim();
  const patterns = [
    /^(.+?) is required\.?$/i,
    /^(.+?) are required\.?$/i,
    /^At least one of (.+?) is required\.?$/i,
    /^(.+?) must not exceed \d+ characters\.?$/i,
    /^(.+?) must contain only digits\.?$/i,
    /^(.+?) allows only numbers with up to \d+ decimals.*$/i,
    /^(.+?) cannot be longer than \d+ characters.*$/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return trimmed;
};

const resolveFieldLabel = (reviewKey, message, editedDataContext = null) => {
  const fromPath = editedDataContext
    ? labelForIndexedPath(reviewKey, editedDataContext)
    : labelForPath(reviewKey);

  if (fromPath && !looksLikeDevPath(fromPath)) return fromPath;
  return schemaMessageToLabel(message);
};

const adaptGeneralInfo = (generalInfo = {}) => {
  const adapted = {};
  Object.entries(generalInfo).forEach(([key, value]) => {
    adapted[key] = flattenScalar(value);
  });
  return adapted;
};

const adaptParty = (party = {}) => ({
  ...party,
  countryName: flattenScalar(party.countryName),
});

const adaptContainer = (container = {}) => ({
  ...container,
  containerCode: flattenScalar(container.containerCode),
  containerNo: flattenScalar(container.containerNo),
  reeferCargo: Boolean(container.reeferCargo),
  dangerousGoods: Boolean(container.dangerousGoods),
});

const adaptItem = (item = {}, dangerousGoods = false) => ({
  ...item,
  packageTypeName: flattenScalar(item.packageTypeName),
  containerNo: hasText(item.containerNo) ? [String(item.containerNo).trim()] : [],
  numberOfPackages:
    item.numberOfPackages === null || item.numberOfPackages === undefined
      ? ""
      : String(item.numberOfPackages),
  cargoGrossWeight:
    item.cargoGrossWeight === null || item.cargoGrossWeight === undefined
      ? ""
      : String(item.cargoGrossWeight),
});

export const adaptReviewToHbl = (editedData = {}) => {
  const containers = Array.isArray(editedData.containers)
    ? editedData.containers
    : [];
  const items = Array.isArray(editedData.items) ? editedData.items : [];
  const dgContainerNoSet = new Set(
    containers
      .filter((container) => container?.dangerousGoods === true)
      .map((container) => String(container?.containerNo ?? "").trim())
      .filter(Boolean),
  );

  return {
    generalInfo: adaptGeneralInfo(editedData.generalInfo),
    parties: (Array.isArray(editedData.parties) ? editedData.parties : []).map(
      adaptParty,
    ),
    containers: containers.map(adaptContainer),
    items: items.map((item) =>
      adaptItem(item, dgContainerNoSet.has(String(item?.containerNo ?? "").trim())),
    ),
    dgContainerNoSet,
  };
};

const collectMasterFieldPaths = (editedData = {}) => {
  const paths = [];

  const pushIfMaster = (segments, value) => {
    if (isMasterFieldObject(value)) {
      paths.push({ segments, field: value });
    }
  };

  const generalInfo = editedData.generalInfo || {};
  [
    "portOfAcceptance",
    "portOfLoading",
    "portOfDischarge",
    "endDestination",
  ].forEach((key) => {
    pushIfMaster(["generalInfo", key], generalInfo[key]);
  });

  (editedData.parties || []).forEach((party, index) => {
    pushIfMaster(["parties", index, "countryName"], party?.countryName);
  });

  (editedData.containers || []).forEach((container, index) => {
    pushIfMaster(["containers", index, "containerCode"], container?.containerCode);
  });

  (editedData.items || []).forEach((item, index) => {
    pushIfMaster(["items", index, "packageTypeName"], item?.packageTypeName);
  });

  return paths;
};

const validateMasterSync = (editedData = {}) => {
  const errorsByPath = {};
  const unsyncedMasters = [];

  collectMasterFieldPaths(editedData).forEach(({ segments, field }) => {
    if (!hasText(field?.value)) return;
    if (isMasterInSync(field)) return;

    const key = pathKey(segments);
    errorsByPath[key] = MASTER_SYNC_ERROR;
    unsyncedMasters.push({
      path: key,
      label: resolveFieldLabel(key, MASTER_SYNC_ERROR, editedData),
      message: MASTER_SYNC_ERROR,
    });
  });

  return { errorsByPath, unsyncedMasters };
};

const pickableGeneralInfoKeys = PDF_REVIEW_GENERAL_INFO_KEYS.filter(
  (key) => key in generalInfoDetails.fields,
);

const pdfReviewGeneralInfoSchema = generalInfoDetails
  .pick(pickableGeneralInfoKeys)
  .shape({
    // filingPartyMpciID: Yup.string()
    //   .concat(specialCharValidation("filingPartyMpciID"))
    //   .max(7, "Filing Party MPCI ID must not exceed 7 characters")
    //   .required("Filing Party MPCI ID is required"),
  });

const validateGeneralInfo = (generalInfo) => {
  const errorsByPath = {};
  const missingMandatory = [];

  try {
    pdfReviewGeneralInfoSchema.validateSync(generalInfo, { abortEarly: false });
  } catch (error) {
    (error.inner || [error]).forEach((err) => {
      const key = yupPathToReviewKey(`generalInfo.${err.path}`);
      if (!key || errorsByPath[key]) return;
      errorsByPath[key] = err.message;
      missingMandatory.push({
        path: key,
        label: resolveFieldLabel(key, err.message),
        message: err.message,
      });
    });
  }

  return { errorsByPath, missingMandatory };
};

const validateParties = (parties) => {
  const errorsByPath = {};
  const missingMandatory = [];

  parties.forEach((party, index) => {
    const isConsigneeRequired = party?.partyType !== "Consignee";
    const schema = buildPartyDetailsSchema({ isConsigneeRequired });

    try {
      schema.validateSync(party, { abortEarly: false });
    } catch (error) {
      (error.inner || [error]).forEach((err) => {
        const key = yupPathToReviewKey(`parties[${index}].${err.path}`);
        if (!key || errorsByPath[key]) return;
        errorsByPath[key] = err.message;
        missingMandatory.push({
          path: key,
          label: resolveFieldLabel(key, err.message, { parties }),
          message: err.message,
        });
      });
    }
  });

  return { errorsByPath, missingMandatory };
};

const validateContainers = (containers) => {
  const errorsByPath = {};
  const missingMandatory = [];

  const schema = buildContainerDetailsSchema({ containerNoMode: "string" });

  containers.forEach((container, index) => {
    try {
      schema.validateSync(container, { abortEarly: false });
    } catch (error) {
      (error.inner || [error]).forEach((err) => {
        let key = yupPathToReviewKey(`containers[${index}].${err.path}`);
        if (err.path === "sealGroup") {
          key = yupPathToReviewKey(`containers[${index}].carrierSeal`);
        }
        if (!key || errorsByPath[key]) return;
        errorsByPath[key] = err.message;
        missingMandatory.push({
          path: key,
          label: resolveFieldLabel(key, err.message, { containers }),
          message: err.message,
        });
      });
    }
  });

  return { errorsByPath, missingMandatory };
};

const validateItems = (items, dgContainerNoSet) => {
  const errorsByPath = {};
  const missingMandatory = [];

  items.forEach((item, index) => {
    const taggedContainerNo = Array.isArray(item.containerNo)
      ? String(item.containerNo[0] ?? "").trim()
      : String(item.containerNo ?? "").trim();
    const dangerousGoods = dgContainerNoSet.has(taggedContainerNo);
    const schema = buildItemDetailsSchema({
      dangerousGoods,
      hsCodeRequired: true,
    });

    try {
      schema.validateSync(item, { abortEarly: false });
    } catch (error) {
      (error.inner || [error]).forEach((err) => {
        const key = yupPathToReviewKey(`items[${index}].${err.path}`);
        if (!key || errorsByPath[key]) return;
        errorsByPath[key] = err.message;
        missingMandatory.push({
          path: key,
          label: resolveFieldLabel(key, err.message, { items }),
          message: err.message,
        });
      });
    }
  });

  return { errorsByPath, missingMandatory };
};

export const validatePdfReview = (editedData) => {
  if (!editedData) {
    return {
      isValid: false,
      errorsByPath: {},
      missingMandatory: [],
      unsyncedMasters: [],
    };
  }

  const adapted = adaptReviewToHbl(editedData);

  const general = validateGeneralInfo(adapted.generalInfo);
  const parties = validateParties(adapted.parties);
  const containers = validateContainers(adapted.containers);
  const items = validateItems(adapted.items, adapted.dgContainerNoSet);
  const masterSync = validateMasterSync(editedData);

  const errorsByPath = {
    ...general.errorsByPath,
    ...parties.errorsByPath,
    ...containers.errorsByPath,
    ...items.errorsByPath,
    ...masterSync.errorsByPath,
  };

  const missingMandatory = [
    ...general.missingMandatory,
    ...parties.missingMandatory,
    ...containers.missingMandatory,
    ...items.missingMandatory,
  ];

  const unsyncedMasters = masterSync.unsyncedMasters;
  const isValid =
    missingMandatory.length === 0 && unsyncedMasters.length === 0;

  return {
    isValid,
    errorsByPath,
    missingMandatory,
    unsyncedMasters,
  };
};

export const isReviewFieldRequired = (fieldKey) =>
  PDF_REVIEW_REQUIRED_FIELD_KEYS.has(fieldKey);

export const isPartyFieldRequired = (partyType, fieldKey) => {
  if (fieldKey === "countryName" || fieldKey === "partyName" || fieldKey === "address" || fieldKey === "cityName") {
    return partyType !== "Consignee";
  }
  return false;
};
