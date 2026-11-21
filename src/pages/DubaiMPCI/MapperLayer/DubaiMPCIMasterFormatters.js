const normalizeText = (value) => String(value ?? "").trim();

const withDisplayLabel = (row = {}, displayLabel) => ({
  ...row,
  displayLabel: normalizeText(displayLabel),
});

const formatPortDisplayLabel = (row = {}) => {
  const portName = normalizeText(row?.portName);
  const portCode = normalizeText(row?.portCode);

  if (portName && portCode) {
    return `${portName} (${portCode})`;
  }

  return normalizeText(row?.listValue || portName || portCode);
};

const formatCountryDisplayLabel = (row = {}) => {
  const countryName = normalizeText(row?.countryName);
  const countryCode = normalizeText(row?.countryCode);

  if (countryName && countryCode) {
    return `${countryName} (${countryCode})`;
  }

  return countryName || countryCode;
};

const formatCurrencyDisplayLabel = (row = {}) => {
  const code = normalizeText(row?.code);
  const name = normalizeText(row?.name);

  if (code && name) {
    return `${code}-${name}`;
  }

  return code || name;
};

const formatCarrierDisplayLabel = (row = {}) => {
  const carrierCode = normalizeText(row?.carrierCode);
  const carrierName = normalizeText(row?.carrierName);

  if (carrierCode && carrierName) {
    return `${carrierName} (${carrierCode})`;
  }

  return carrierCode || carrierName;
};

const formatContainerDisplayLabel = (row = {}) => {
  const containerCode = normalizeText(row?.containerCode);
  const containerName = normalizeText(row?.containerName);

  if (containerCode && containerName) {
    return `${containerCode} - (${containerName}) `;
  }

  return containerCode || containerName;
};

const formatHsCodeDisplayLabel = (row = {}) => {
  const hsCode = normalizeText(row?.hsCode);
  const hsCodeName = normalizeText(row?.hsCodeName);

  if (hsCode && hsCodeName) {
    return `${hsCode} - ${hsCodeName}`;
  }

  return hsCode || hsCodeName;
};

export const formatEfsAgentDisplayLabel = (row = {}) => {
  const agentName = normalizeText(row?.agentName);
  const agentCode = normalizeText(row?.agentCode);

  if (agentName && agentCode) {
    return `${agentName} (${agentCode})`;
  }

  return agentName || agentCode;
};

const MASTER_OPTION_FORMATTERS = {
  PORTNAME: (row) => withDisplayLabel(row, formatPortDisplayLabel(row)),
  COUNTRY: (row) => withDisplayLabel(row, formatCountryDisplayLabel(row)),
  CURRENCY: (row) => withDisplayLabel(row, formatCurrencyDisplayLabel(row)),
  CARRIER: (row) => withDisplayLabel(row, formatCarrierDisplayLabel(row)),
  CONTAINER: (row) => withDisplayLabel(row, formatContainerDisplayLabel(row)),
  HS_CODE: (row) => withDisplayLabel(row, formatHsCodeDisplayLabel(row)),
  EFSAGENTNAME: (row) => withDisplayLabel(row, formatEfsAgentDisplayLabel(row)),
};

export const normalizeMpciMasterOptions = (type, rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  const formatter = MASTER_OPTION_FORMATTERS[type];
  if (typeof formatter !== "function") {
    return rows;
  }

  return rows.map((row) => formatter(row));
};
