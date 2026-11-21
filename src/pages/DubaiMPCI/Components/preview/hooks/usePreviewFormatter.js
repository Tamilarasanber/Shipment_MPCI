// hooks/usePreviewFormatter.js
import { useSelector } from "react-redux";
import { previewFieldMap } from "../config/previewFieldMap";

export const usePreviewFormatter = () => {
  const generalInfoDetails =
    useSelector((state) => state.DubaiFormFiling?.generalInfoDetails) || {};
  const partiesDetails =
    useSelector((state) => state.DubaiFormFiling?.partiesDetails) || {};
  const jobDetails =
    useSelector((state) => state.DubaiFormFiling?.jobDetails) || {};
  const containerDetails =
    useSelector((state) => state.DubaiFormFiling?.containerDetails) || {};
  const itemDetails =
    useSelector((state) => state.DubaiFormFiling?.itemDetails) || {};

  /* ---------------- MASTER LIST REGISTRY ---------------- */
  const masterLists = {
    /* ---- Job Details ---- */
    carrierName: jobDetails.carrierList || [],
    firstPortLoadingName: jobDetails.firstPortOfLoadingList || [],
    lastForeignPortName: jobDetails.lastForeignPortList || [],
    portOfDischargeName: jobDetails.portOfDischargeList || [],
    vesselName: jobDetails.vesselList || [],
    vesselCountryName: jobDetails.vesselCountryList || [],

    /* ---- General Info ---- */
    portOfAcceptance: generalInfoDetails.portOfAcceptanceList || [],
    portOfTranshipment: generalInfoDetails.portOfTranshipmentList || [],
    endDestination: generalInfoDetails.endDestinationList || [],
    placeOfBillIssueName: generalInfoDetails.placeOfBillIssueList || [],
    placeOfFreightPaymentName:
      generalInfoDetails.placeOfFreightPaymentList || [],
    currencyName: generalInfoDetails.currencyList || [],

    /* ---- Parties ---- */
    cityName: partiesDetails.cityList || [],
    state: partiesDetails.stateList || [],
    country: partiesDetails.countryList || [],

    /* ---- Container ---- */
    containerCode: containerDetails.containerCodeList || [],
    "container.packageTypeName": containerDetails.packageTypeList || [],
    handlingInstructionName:
      containerDetails.handlingInstructionList || [],

    /* ---- Item ---- */
    hsCode: itemDetails.hsCodeList || [],
    "item.packageTypeName": itemDetails.packageTypeList || [],
    markingInstructionName:
      itemDetails.markingInstructionList || [],
    packingRelatedDescCode:
      itemDetails.packingDescCodeList || [],
    countryOfOriginName:
      itemDetails.itemCountryList || [],
  };

  const resolveFromOptions = (options = [], value) =>
    options.find((o) => o.value === value)?.label || value;

  const resolveFromMaster = (options, value, labelKey, valueKey) =>
    options.find((o) => o?.[valueKey] === value)?.[labelKey] || value;

  const formatValue = (fieldKey, value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "-";

    const config = previewFieldMap[fieldKey];
    if (!config) return value;

    if (config.type === "static") {
      return resolveFromOptions(config.options, value);
    }

    return resolveFromMaster(
      masterLists[fieldKey] || [],
      value,
      config.labelKey,
      config.valueKey,
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return { formatValue, formatDate };
};
