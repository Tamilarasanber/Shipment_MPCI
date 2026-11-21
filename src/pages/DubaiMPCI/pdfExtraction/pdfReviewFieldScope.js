// Single source of truth for which fields the PDF review form shows and validates
// at the Mark as reviewed gate. See hbl-gemini-extraction/feature-spec.md —
// Review form field scope.

/** General-info keys validated at the review gate (mirrors PdfReviewForm). */
export const PDF_REVIEW_GENERAL_INFO_KEYS = [
  "hblNo",
  "movementType",
  "blType",
  "cargoType",
  "portOfAcceptance",
  "portOfLoading",
  "portOfDischarge",
  "endDestination",
  // "filingPartyMpciID",
  "splitBl",
  "originalNo",
];

/**
 * Deferred to the HBL detail section — MPCI rule-driven or not extracted.
 * Not validated at Mark as reviewed.
 */
export const PDF_REVIEW_DEFERRED_GENERAL_INFO_KEYS = [
  "parentBlNumber",
  "parentBlIssuerPartyName",
  "parentBlIssuerPartyMpciId",
  "liablePartyMpciId",
  "futureChildBl",
  "portOfTranshipment",
  "actionCode",
  "amendmentType",
  "filingRemarks",
  "filingAttachments",
];

/** Required markers on the PDF review form (generalInfo + containers + items). */
export const PDF_REVIEW_REQUIRED_FIELD_KEYS = new Set([
  "generalInfo.hblNo",
  "generalInfo.movementType",
  "generalInfo.blType",
  "generalInfo.cargoType",
  "generalInfo.portOfAcceptance",
  "generalInfo.endDestination",
  // "generalInfo.filingPartyMpciID",
  "containers.containerCode",
  "containers.containerNo",
  "containers.containerStatus",
  "items.numberOfPackages",
  "items.packageTypeName",
  "items.cargoGrossWeight",
  "items.itemDescription",
  "items.marksAndNumbers",
  "items.containerNo",
  "items.hsCode",
]);
