import { initialHBLPartiesValue } from "../InitialValues/initialHBLPartiesValue";

export const EMPTY_SHIPMENT_PARTY_SUMMARY_INDEX = Object.freeze({
  byHblNo: Object.freeze({}),
  byPartyType: Object.freeze({}),
});

export const normalizeLinkedPartyType = (partyType = "") => {
  const value = String(partyType || "").trim();
  if (value === "Origin Agent") return "Forwarding Agent";
  return value;
};

export const dedupePartiesByType = (parties = []) => {
  const keyedParties = new Map();

  (Array.isArray(parties) ? parties : []).forEach((party) => {
    const normalizedPartyType = normalizeLinkedPartyType(party?.partyType);
    const partyKey = normalizedPartyType || party?.id || crypto.randomUUID();

    keyedParties.set(partyKey, {
      ...party,
      partyType: normalizedPartyType || party?.partyType || "",
    });
  });

  return Array.from(keyedParties.values());
};

const normalizeLookupKey = (value = "") => String(value || "").trim();

export const buildShipmentPartySummaryIndex = (shipmentSummaries = []) => {
  const byHblNo = {};
  const byPartyType = {};

  (Array.isArray(shipmentSummaries) ? shipmentSummaries : []).forEach(
    (summary) => {
      const summaryHblNo = normalizeLookupKey(summary?.hblNo);
      const partyDetails = Array.isArray(summary?.partyDetails)
        ? summary.partyDetails
        : [];

      partyDetails.forEach((party) => {
        const partyType = normalizeLinkedPartyType(party?.partyType);
        if (!partyType) return;

        const partySummary = {
          ...party,
          partyType,
          summaryHblNo,
          summaryShipmentId: summary?.id ?? null,
        };

        if (summaryHblNo) {
          byHblNo[summaryHblNo] = byHblNo[summaryHblNo] || {};
          byHblNo[summaryHblNo][partyType] = partySummary;
        }

        if (!byPartyType[partyType]) {
          byPartyType[partyType] = partySummary;
        }
      });
    },
  );

  return {
    byHblNo,
    byPartyType,
  };
};

export const getShipmentPartySummary = (
  shipmentPartiesSummaries = {},
  hblNo = "",
  partyType = "",
) => {
  const normalizedHblNo = normalizeLookupKey(hblNo);
  const normalizedPartyType = normalizeLinkedPartyType(partyType);

  if (!normalizedPartyType) {
    return null;
  }

  return (
    shipmentPartiesSummaries?.byHblNo?.[normalizedHblNo]?.[normalizedPartyType] ||
    shipmentPartiesSummaries?.byPartyType?.[normalizedPartyType] ||
    null
  );
};

export const buildAutoFilledParty = (
  partyType,
  shipmentPartiesSummaries = {},
  hblNo = "",
) => {
  const normalizedPartyType = normalizeLinkedPartyType(partyType);
  const baseParty = initialHBLPartiesValue(normalizedPartyType);
  const matchedPartySummary = getShipmentPartySummary(
    shipmentPartiesSummaries,
    hblNo,
    normalizedPartyType,
  );

  if (!matchedPartySummary) {
    return baseParty;
  }

  return {
    ...baseParty,
    partyType: normalizedPartyType,
    partyName: matchedPartySummary?.partyName ?? "",
    taxID: matchedPartySummary?.taxId ?? "",
    address:
      matchedPartySummary?.address ??
      matchedPartySummary?.addressLine1 ??
      "",
    cityName: matchedPartySummary?.cityName ?? "",
    cityId: matchedPartySummary?.cityId ?? "",
    stateName: matchedPartySummary?.stateName ?? "",
    stateId: matchedPartySummary?.stateId ?? "",
    countryId: matchedPartySummary?.countryId ?? "",
    countryName: matchedPartySummary?.countryName ?? null,
    poBox: matchedPartySummary?.poBox ?? "",
    qualifier: matchedPartySummary?.qualifier ?? "",
    identifierNo: matchedPartySummary?.identifierNo ?? "",
    contactPartyType:
      matchedPartySummary?.contactPartyType || baseParty.contactPartyType,
    contactDetail: matchedPartySummary?.contactDetail ?? "",
    mobile: matchedPartySummary?.mobile ?? matchedPartySummary?.phone ?? "",
    email: matchedPartySummary?.email ?? "",
  };
};
