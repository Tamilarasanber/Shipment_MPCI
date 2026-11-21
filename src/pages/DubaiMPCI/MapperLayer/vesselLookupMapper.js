import { initialDubaiFilingValue } from "../InitialValues/initialDubaiFilingValue";

// Vessel lookup API returns enough data to refresh only the vessel-related fields.
// Keeping this mapper separate makes the UI component generic and easier to maintain.
export const mapVesselLookupResponseToFormValues = (vessel = {}) => ({
  vesselName: vessel?.vesselName ?? "",
  vesselId: vessel?.id ?? initialDubaiFilingValue.vesselId,
  vesselCountryName:
    vessel?.vesselCountryName ?? initialDubaiFilingValue.vesselCountryName,
  vesselCountryId:
    vessel?.vesselCountryId ?? initialDubaiFilingValue.vesselCountryId,
  vesselCountryCode:
    vessel?.vesselCountryCode ?? initialDubaiFilingValue.vesselCountryCode,
});

// Clears lookup-derived vessel fields when the user types free text instead of
// picking a vessel from the API dropdown.
export const clearVesselLookupRelatedFormValues = () => ({
  vesselId: initialDubaiFilingValue.vesselId,
  vesselCountryName: initialDubaiFilingValue.vesselCountryName,
  vesselCountryId: initialDubaiFilingValue.vesselCountryId,
  vesselCountryCode: initialDubaiFilingValue.vesselCountryCode,
});

export const getVesselLookupOptionKey = (vessel = {}) =>
  String(vessel?.vesselName || "").trim().toLowerCase();
