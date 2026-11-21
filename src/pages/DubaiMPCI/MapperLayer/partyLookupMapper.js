import { initialHBLPartiesValue } from "../InitialValues/initialHBLPartiesValue";

// Party lookup API gives plain text values, so we intentionally clear related ids.
// This avoids stale master ids staying in the form after a lookup-based autofill.
export const mapPartyLookupResponseToPartyFormValues = (party = {}, context = {}) => {
  const currentPartyType = context?.currentRowValues?.partyType;
  const partyType = currentPartyType ?? party?.partyType ?? "";
  const baseValues = initialHBLPartiesValue(partyType);
  const { id: _unusedId, ...basePartyValues } = baseValues;

  return {
    ...basePartyValues,
    partyType,
    partyName: party?.partyName ?? "",
    address: party?.address ?? "",
    cityName: party?.cityName ?? "",
    stateName: party?.stateName ?? "",
    countryName: party?.countryName ?? null,
    countryId: party?.countryId ?? null,
    mobile: party?.mobile ?? party?.phone ?? "",
    email: party?.email ?? "",
    poBox: party?.poBox ?? "",
    taxID: party?.taxId ?? "",
    qualifier: party?.qualifier ?? "",
    contactPartyType: party?.contactPartyType ?? "",
    identifierNo: party?.identifierNo ?? "",
    contactDetail: party?.contactName ?? "",
  };
};

export const getPartyLookupOptionKey = (party = {}) =>
  String(party?.partyName || "").trim().toLowerCase();
