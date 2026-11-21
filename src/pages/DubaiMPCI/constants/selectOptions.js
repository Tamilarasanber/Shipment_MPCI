export const actionCodeOptions = [
  { label: "New", value: "N" },
  { label: "Update", value: "U" },
  { label: "Cancel", value: "C" },
];

export const actionCodeHBLOptions = [
  // { label: "New", value: "New" },
  { label: "Update", value: "U" },
  { label: "Cancel", value: "C" },
];

export const filingForOptions = [
  {
    label: "Self - Local UAE Freight Forwarder",
    value: "Self - Local UAE Freight Forwarder",
  },
  {
    label: "On behalf of Partner UAE Freight Forwarder",
    value: "On behalf of Partner UAE Freight Forwarder",
  },
];

export const filingTypeOptions = [
  { label: "Freight Forwarder", value: "FF" },
  { label: "Master Co-Loader", value: "MCL" },
  { label: "Sub Co-Loader", value: "SCL" },
];

export const amendmentTypeOptions = [
  { label: "CHG - Change / Update existing data", value: "CHG" },
  { label: "RIR - Response to Request for Information", value: "RIR" },
  { label: "SPL - Split Bill of Lading", value: "SPL" },
  { label: "SWB - Switch Bill of Lading", value: "SWB" },
  { label: "RIJ - Information cannot be provided", value: "RIJ" },
  { label: "CXL - Cancel the filing", value: "CXL" },
];

export const furtherChildBlOptions = [
  { label: "No", value: "No" },
  { label: "Yes", value: "Yes" },
];

export const movementTypeOptions = [
  { label: "Import", value: "IMPORT" },
  { label: "Transit", value: "TRANSIT" },
  // { label: "Transhipment", value: "TRANSHIPMENT" },
  // { label: "FROB", value: "FROB" },
];

export const blTypeOptions = [
  { label: "Negotiable", value: "Negotiable" },
  { label: "Non-Negotiable", value: "Non-Negotiable" },
];

export const cargoTypeOptions = [
  { label: "1 - Documents", value: "1" },
  {
    label: "2 - Low value non-dutiable consignments",
    value: "2",
  },
  {
    label: "3 - Low value dutiable consignments",
    value: "3",
  },
  {
    label: "4 - High value consignments",
    value: "4",
  },
  { label: "9 - Containerized", value: "9" },
  { label: "13 - Liquid cargo", value: "13" },
  { label: "19 - Obnoxious", value: "19" },
  { label: "20 - Out of gauge", value: "20" },
  {
    label: "21 - Household goods and personal effects",
    value: "21",
  },
];

export const emirateOptions = [
  { label: "Abu Dhabi", value: "AZ" },
  { label: "Dubai", value: "DU" },
  { label: "Sharjah", value: "SH" },
  { label: "Umm Al Quwain", value: "UQ" },
  { label: "Ajman", value: "AJ" },
  { label: "Al Fujairah", value: "FU" },
  { label: "Ras Al Khaimah", value: "RK" },
];

export const freightPrepaidAndCollectOptions = [
  { label: "Prepaid", value: "P_PREPAID" },
  { label: "Collect", value: "C_COLLECT" },
  { label: "Payable elsewhere", value: "A_PAYABLE_ELSEWHERE" },
  { label: "Third Party to Pay", value: "B_THIRD_PARTY" },
];

export const serviceRequirementOptions = [
  { label: "Full Loads", value: "FULL_LOADS" },
  { label: "Shipper Loads", value: "SHIPPER_LOADS" },
  { label: "Consignee Loads", value: "CONSIGNEE_LOADS" },
  { label: "Carrier Loads", value: "CARRIER_LOADS" },
];

export const containerStatusOptions = [
  { label: "FCL", value: "FCL" },
  { label: "LCL", value: "LCL" },
  { label: "EMPTY", value: "EMPTY" },
];

export const shipperSealTypeOptions = [
  { label: "Electronic", value: "Electronic" },
  { label: "Mechanical", value: "Mechanical" },
];

export const carrierSealTypeOptions = [
  { label: "Electronic", value: "Electronic" },
  { label: "Mechanical", value: "Mechanical" },
];

export const customsSealTypeOptions = [
  { label: "Electronic", value: "Electronic" },
  { label: "Mechanical", value: "Mechanical" },
];

export const splitFilingOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export const unitOptions = [
  { label: "CEL - Celsius", value: "CEL" },
  { label: "FAH - Fahrenheit", value: "FAH" },
];

export const ADDITIONAL_PARTY_OPTIONS = [
  // { label: "Consignee", value: "Consignee" },
  { label: "First Notify", value: "First Notify" },
  { label: "Second Notify", value: "Second Notify" },
  // { label: "Forwarding Agent", value: "Forwarding Agent" },
  { label: "Delivery Agent", value: "Delivery Agent" },
  {
    label: "Payer on behalf of importer",
    value: "Payer on behalf of importer",
  },
];

export const QUALIFIER_OPTIONS = [
  { value: "1", label: "1 - Establishment" },
  { value: "2", label: "2 - Individual" },
];

export const CONTACT_PARTY_TYPE_OPTIONS = [
  { value: "COMPANY", label: "Company" },
  { value: "INDIVIDUAL", label: "Individual" },
];

export const removedItemOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export const imoClassOptions = [
  { label: "1 - Explosives", value: "1" },
  { label: "1.1 - Mass explosion hazard", value: "1.1" },
  {
    label: "1.2 - Projection hazard but not a mass explosion hazard",
    value: "1.2",
  },
  { label: "1.3 - Fire hazard and either a minor hazard", value: "1.3" },
  { label: "1.4 - No significant hazard", value: "1.4" },
  {
    label:
      "1.5 - Very insensitive substances which have a mass explosion hazard",
    value: "1.5",
  },
  { label: "1.6 - Extremely insensitive articles", value: "1.6" },

  { label: "2 - Gases", value: "2" },
  { label: "2.1 - Flammable gases", value: "2.1" },
  { label: "2.2 - Non-flammable, non-toxic gases", value: "2.2" },
  { label: "2.3 - Toxic gases", value: "2.3" },

  { label: "3 - Flammable liquids", value: "3" },

  { label: "4 - Flammable solids", value: "4" },
  {
    label:
      "4.1 - Flammable solids, self-reactive substances and desensitized explosives",
    value: "4.1",
  },
  { label: "4.2 - Substances liable to spontaneous combustion", value: "4.2" },
  {
    label:
      "4.3 - Substances which, in contact with water, emit flammable gases",
    value: "4.3",
  },

  { label: "5 - Oxidizing substances and organic peroxides", value: "5" },
  { label: "5.1 - Oxidizing substances", value: "5.1" },
  { label: "5.2 - Organic peroxides", value: "5.2" },

  { label: "6 - Toxic and infectious substances", value: "6" },
  { label: "6.1 - Toxic substances", value: "6.1" },
  { label: "6.2 - Infectious substances", value: "6.2" },

  { label: "7 - Radioactive material", value: "7" },

  { label: "8 - Corrosive substances", value: "8" },

  { label: "9 - Miscellaneous dangerous substances and articles", value: "9" },
];
