import { useMpciRules as getMpciRules } from "../hooks/useMpciRules";
import { isUaeMpciCustomerRole } from "./loginUserDataUtils";
import { isVisible } from "./mpciFieldUtils";
import { normalizeContainerNumberList } from "./containerHeaderUtils";

const CONTAINER_NUMBER_REGEX = /^[A-Z]{4}[0-9]{7}$/;

const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

export const hasValidationErrors = (errorNode) => {
  if (!errorNode) return false;

  if (typeof errorNode === "string") {
    return errorNode.trim().length > 0;
  }

  if (Array.isArray(errorNode)) {
    return errorNode.some((item) => hasValidationErrors(item));
  }

  if (typeof errorNode === "object") {
    return Object.values(errorNode).some((value) => hasValidationErrors(value));
  }

  return false;
};

export const isGeneralInfoSectionComplete = (
  values = {},
  errors = {},
  loginUserData = {},
) => {
  const requiredFields = ["actionCode", "filingfor", "filingType"];

  if (!isUaeMpciCustomerRole(loginUserData)) {
    requiredFields.push("efsAgentNameField");
  }

  const basicsFilled = requiredFields.every((field) => hasValue(values[field]));
  const basicsValid = requiredFields.every(
    (field) => !hasValidationErrors(errors?.[field]),
  );
  const hasAtLeastOneHbl = Array.isArray(values.hblList) && values.hblList.length > 0;

  return basicsFilled && basicsValid && hasAtLeastOneHbl;
};

export const isJobDetailsSectionComplete = (values = {}, errors = {}) => {
  const rules = getMpciRules(values, "JobDetailsSection");
  const requiredFields = [
    "carrierName",
    "mblNo",
    "cargoType",
    // "etd",
    "eta",
    "firstPortLoadingName",
    "lastForeignPortName",
    "portOfDischargeName",
    "vesselName",
    "voyageNo",
    "vesselCountryName",
  ];

  if (isVisible("filingPartyMpciID", rules)) {
    requiredFields.push("filingPartyMpciID");
  }
  if (isVisible("liablePartyMpciId", rules)) {
    requiredFields.push("liablePartyMpciId");
  }

  const hasFieldLevelErrors = requiredFields.some((field) =>
    hasValidationErrors(errors?.[field]),
  );

  const hasValidContainerHeaders =
    Array.isArray(values.containerHeaders) &&
    values.containerHeaders.length > 0 &&
    values.containerHeaders.every((header) => {
      if (!header) return false;

      const hasAtLeastOneSeal = Boolean(
        String(header.shipperSealHeader ?? "").trim() ||
          String(header.carrierSealHeader ?? "").trim() ||
          String(header.customsSealHeader ?? "").trim(),
      );

      if (!hasValue(header.containerCodeHeader)) return false;
      if (!hasValue(header.containerStatusHeader)) return false;
      const normalizedContainerNumbers = normalizeContainerNumberList(
        header.containerNoHeader,
      );

      if (!normalizedContainerNumbers.length) {
        return false;
      }

      if (!normalizedContainerNumbers.every((value) => CONTAINER_NUMBER_REGEX.test(value))) {
        return false;
      }
      if (!hasAtLeastOneSeal) return false;

      if (
        String(header.customsSealHeader ?? "").trim() &&
        !hasValue(header.sealingPartyNameHeader)
      ) {
        return false;
      }

      if (header.reeferCargoHeader) {
        if (!hasValue(header.temperatureHeader) || !hasValue(header.unitCodeHeader)) {
          return false;
        }
      }

      return true;
    });

  return (
    requiredFields.every((field) => hasValue(values[field])) &&
    !hasFieldLevelErrors &&
    !hasValidationErrors(errors?.containerHeaders) &&
    hasValidContainerHeaders
  );
};
