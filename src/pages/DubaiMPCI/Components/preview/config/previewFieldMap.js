// config/previewFieldMap.js
import {
  actionCodeOptions,
  filingForOptions,
  filingTypeOptions,
  amendmentTypeOptions,
  furtherChildBlOptions,
  movementTypeOptions,
  blTypeOptions,
  cargoTypeOptions,
  emirateOptions,
  freightPrepaidAndCollectOptions,
  serviceRequirementOptions,
  containerStatusOptions,
  shipperSealTypeOptions,
  carrierSealTypeOptions,
  customsSealTypeOptions,
  splitFilingOptions,
  unitOptions,
  CONTACT_PARTY_TYPE_OPTIONS,
} from "../../../constants/selectOptions";

export const previewFieldMap = {
  /* -------- Static (FormikSelect) -------- */
  actionCode: { type: "static", options: actionCodeOptions },
  filingfor: { type: "static", options: filingForOptions },
  filingType: { type: "static", options: filingTypeOptions },
  amendmentType: { type: "static", options: amendmentTypeOptions },
  futureChildBl: { type: "static", options: furtherChildBlOptions },
  movementType: { type: "static", options: movementTypeOptions },
  blType: { type: "static", options: blTypeOptions },
  cargoType: { type: "static", options: cargoTypeOptions },
  emirate: { type: "static", options: emirateOptions },
  freightPaymentType: {
    type: "static",
    options: freightPrepaidAndCollectOptions,
  },
  serviceRequirement: {
    type: "static",
    options: serviceRequirementOptions,
  },
  containerStatus: { type: "static", options: containerStatusOptions },
  shipperSealType: { type: "static", options: shipperSealTypeOptions },
  carrierSealType: { type: "static", options: carrierSealTypeOptions },
  customsSealType: { type: "static", options: customsSealTypeOptions },
  removeContainerSplit: { type: "static", options: splitFilingOptions },
  unitCode: { type: "static", options: unitOptions },
  contactPartyType: { type: "static", options: CONTACT_PARTY_TYPE_OPTIONS },

  /* -------- Master (API) -------- */
  carrierName: {
    type: "master",
    labelKey: "carrierName",
    valueKey: "carrierName",
  },
  firstPortLoadingName: {
    type: "master",
    labelKey: "portName",
    valueKey: "portCode",
  },
  lastForeignPortName: {
    type: "master",
    labelKey: "listValue",
    valueKey: "portCode",
  },
  portOfDischargeName: {
    type: "master",
    labelKey: "listValue",
    valueKey: "portCode",
  },
  vesselName: {
    type: "master",
    labelKey: "vesselName",
    valueKey: "vesselShortName",
  },
  vesselCountryName: {
    type: "master",
    labelKey: "countryName",
    valueKey: "currencyCode",
  },
  portOfAcceptance: {
    type: "master",
    labelKey: "portName",
    valueKey: "portCode",
  },
  portOfTranshipment: {
    type: "master",
    labelKey: "portName",
    valueKey: "portCode",
  },
  endDestination: {
    type: "master",
    labelKey: "portName",
    valueKey: "portCode",
  },
  placeOfBillIssueName: {
    type: "master",
    labelKey: "stateName",
    valueKey: "stateName",
  },
  placeOfFreightPaymentName: {
    type: "master",
    labelKey: "stateName",
    valueKey: "stateName",
  },
  currencyName: {
    type: "master",
    labelKey: "name",
    valueKey: "code",
  },
  /* ---- Parties ---- */
  cityName: {
    type: "party-master",
    labelKey: "cityName",
    valueKey: "cityName",
  },
  state: {
    type: "party-master",
    labelKey: "stateName",
    valueKey: "stateName",
  },
  country: {
    type: "party-master",
    labelKey: "countryName",
    valueKey: "id",
  },

  /* ---- Container ---- */
  containerCode: {
    type: "container-master",
    labelKey: "containerCode",
    valueKey: "containerCode",
  },
  "container.packageTypeName": {
    type: "container-master",
    labelKey: "typeName",
    valueKey: "typeCode",
  },
  handlingInstructionName: {
    type: "container-master",
    labelKey: "name",
    valueKey: "name",
  },

  /* ---- Item ---- */
  hsCode: {
    type: "item-master",
    labelKey: "hsCode",
    valueKey: "hsCode",
  },
  "item.packageTypeName": {
    type: "item-master",
    labelKey: "typeName",
    valueKey: "typeCode",
  },
  markingInstructionName: {
    type: "item-master",
    labelKey: "name",
    valueKey: "code",
  },
  packingRelatedDescCode: {
    type: "item-master",
    labelKey: "name",
    valueKey: "code",
  },
  countryOfOriginName: {
    type: "item-master",
    labelKey: "countryName",
    valueKey: "currencyCode",
  },
};
