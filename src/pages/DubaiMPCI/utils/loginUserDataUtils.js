export const isUaeMpciCustomerRole = (loginUserData = {}) =>
  loginUserData?.customerRole === "UAE MPCI";

export const getEfsAgentCodes = (loginUserData = {}) => {
  const codes = loginUserData?.efsAgentCodes;
  if (!Array.isArray(codes)) return [];

  const uniqueCodes = [];
  const seen = new Set();

  codes.forEach((code) => {
    const value = String(code ?? "").trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    uniqueCodes.push(value);
  });

  return uniqueCodes;
};

export const getShipmentSourceRole = (loginUserData = {}) => {
  const sources = Array.isArray(loginUserData?.shipmentSource)
    ? loginUserData.shipmentSource
    : [];
  const uniqueRoles = [];
  const seen = new Set();

  sources.forEach((source) => {
    const role = String(source ?? "").trim().toLowerCase();
    if (!role || seen.has(role)) return;
    seen.add(role);
    uniqueRoles.push(role);
  });

  return uniqueRoles.join("_");
};

export const getLoginMpciOverrides = (loginUserData = {}) => {
  const filingPartyMpciId = loginUserData.filingPartyMpciId;
  const liablePartyMpciId = loginUserData.liablePartyMpciId;
  const filingFor = loginUserData.filingFor;

  const overrides = {};

  if (String(filingPartyMpciId ?? "").trim()) {
    overrides.filingPartyMpciID = String(filingPartyMpciId).trim();
  }

  // Skip liablePartyMpciId for Self - Local UAE Freight Forwarder
  if (
    filingFor !== "Self - Local UAE Freight Forwarder" &&
    String(liablePartyMpciId ?? "").trim()
  ) {
    overrides.liablePartyMpciId = String(liablePartyMpciId).trim();
  }

  if (String(filingFor ?? "").trim()) {
    overrides.filingfor = filingFor;
  }

  return overrides;
};