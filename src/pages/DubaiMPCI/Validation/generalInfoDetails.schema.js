import * as Yup from "yup";
import { MPCI_RULES } from "../rules/mpciRules.config";
import { specialCharValidation } from "./specialCharValidation";

export { specialCharValidation } from "./specialCharValidation";

const getRootValues = (ctx) => {
  const fromStack = ctx?.from || [];
  const candidates = [
    ctx?.options?.context,
    ...fromStack.map((n) => n?.value),
  ].filter(Boolean);

  return (
    candidates.find(
      (value) =>
        Array.isArray(value?.hblList) ||
        value?.filingfor ||
        value?.filingType ||
        value?.actionCode,
    ) || {}
  );
};

const buildGeneralInfoRules = (rootValues, generalInfo) => {
  const values = {
    filingfor: rootValues?.filingfor,
    filingType: rootValues?.filingType,
    actionCode: rootValues?.actionCode,
    futureChildBl: generalInfo?.futureChildBl,
  };

  const matchedRules = MPCI_RULES.filter((rule) =>
    Object.entries(rule.when || {}).every(
      ([key, expected]) => values[key] === expected,
    ),
  ).sort(
    (a, b) =>
      Object.keys(a.when || {}).length - Object.keys(b.when || {}).length,
  );

  const result = {
    show: new Set(),
    hide: new Set(),
    defaults: {},
  };

  matchedRules.forEach((rule) => {
    const sectionRules = rule.actions?.GeneralInfoTab;
    if (!sectionRules) return;

    sectionRules.hide?.forEach((f) => {
      result.hide.add(f);
      result.show.delete(f);
    });
    sectionRules.show?.forEach((f) => {
      result.show.add(f);
      result.hide.delete(f);
    });
    Object.assign(result.defaults, sectionRules.defaults || {});
  });

  return result;
};

const hasMeaningfulValue = (value) => Boolean(String(value ?? "").trim());

// HBL duplicate function
const normalizeComparableHblNo = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();
// HBL duplicate function
const getCurrentHblIndex = (ctx) => {
  const path = String(ctx?.path ?? "");
  const matchedIndex = path.match(/hblList(?:\[|\.)(\d+)(?:\]|\.)/);

  return matchedIndex ? Number(matchedIndex[1]) : -1;
};

const getEffectiveFieldValue = (field, rawValue, rules) => {
  if (hasMeaningfulValue(rawValue)) return String(rawValue).trim();
  return String(rules?.defaults?.[field] ?? "").trim();
};

const isRemoteAttachmentFile = (value) => Boolean(value?.__remote);

const requiredWhenVisible = (field, message = "This field is required") =>
  Yup.string().test(
    `required-when-visible-${field}`,
    message,
    function (value) {
      const rootValues = getRootValues(this);
      const rules = buildGeneralInfoRules(rootValues, this.parent);
      const isVisible = !rules.hide.has(field);
      const effectiveValue = getEffectiveFieldValue(field, value, rules);

      if (!isVisible) return true;
      return hasMeaningfulValue(effectiveValue);
    },
  );

const requiredWhenVisibleWithMaxAndSpecialChar = (
  field,
  max,
  requiredMessage,
  maxMessage,
) =>
  Yup.string()
    .concat(specialCharValidation(field))
    .max(max, maxMessage)
    .test(`required-when-visible-${field}`, requiredMessage, function (value) {
      const rootValues = getRootValues(this);
      const rules = buildGeneralInfoRules(rootValues, this.parent);
      const isVisible = !rules.hide.has(field);
      const effectiveValue = getEffectiveFieldValue(field, value, rules);

      if (!isVisible) return true;
      return hasMeaningfulValue(effectiveValue);
    });

export const generalInfoDetails = Yup.object({
  /* ---------------- Always required ---------------- */
  hblNo: Yup.string()
    .concat(specialCharValidation("hblNo"))
    .max(20, "HBL Number must not exceed 20 characters")
    .test(
      "unique-hbl-no",
      "This HBL already exists with the same HBL number.",
      function (value) {
        const normalizedCurrentHblNo = normalizeComparableHblNo(value);

        if (!normalizedCurrentHblNo) {
          return true;
        }

        const rootValues = getRootValues(this);
        const currentHblIndex = getCurrentHblIndex(this);
        const hblList = Array.isArray(rootValues?.hblList)
          ? rootValues.hblList
          : [];

        return !hblList.some((hbl, index) => {
          if (index === currentHblIndex) {
            return false;
          }

          const existingHblNo = normalizeComparableHblNo(
            hbl?.generalInfo?.hblNo,
          );

          return existingHblNo && existingHblNo === normalizedCurrentHblNo;
        });
      },
    )
    .required("HBL Number is required"),

  movementType: Yup.string().required("Movement Type is required"),
  blType: Yup.string().required("BL Type is required"),
  portOfAcceptance: Yup.string().required("Port of Acceptance is required"),
  endDestination: Yup.string().required("End Destination is required"),
  cargoType: Yup.string().required("Cargo Type is required"),
  originalNo: Yup.string().when("splitBl", {
    is: (val) => val === "Yes",
    then: (schema) =>
      schema
        .required("Original BL Number is required")
        .max(20, "Original BL Number must not exceed 20 characters"),
    otherwise: (schema) => schema.notRequired().strip(),
  }),

  /* ---------------- MPCI RULE DRIVEN ---------------- */
  parentBlIssuerPartyMpciId: requiredWhenVisibleWithMaxAndSpecialChar(
    "parentBlIssuerPartyMpciId",
    7,
    "Parent BL Party MPCI ID is required",
    "Parent BL Party MPCI ID must not exceed 7 characters",
  ),

  parentBlNumber: requiredWhenVisibleWithMaxAndSpecialChar(
    "parentBlNumber",
    20,
    "Parent BL Number is required",
    "Parent BL Number must not exceed 20 characters",
  ),

  parentBlIssuerPartyName: requiredWhenVisibleWithMaxAndSpecialChar(
    "parentBlIssuerPartyName",
    50,
    "Parent BL Issuing Party Name is required",
    "Parent BL Issuing Party Name must not exceed 50 characters",
  ),

  filingPartyMpciID: requiredWhenVisibleWithMaxAndSpecialChar(
    "filingPartyMpciID",
    7,
    "Filing Party MPCI ID is required",
    "Filing Party MPCI ID must not exceed 7 characters",
  ),

  liablePartyMpciId: requiredWhenVisibleWithMaxAndSpecialChar(
    "liablePartyMpciId",
    7,
    "Liable UAE Party MPCI ID is required",
    "Liable UAE Party MPCI ID must not exceed 7 characters",
  ),

  futureChildBl: Yup.string().test(
    "required-further-child-by-visibility",
    "Further Child BL selection is required",
    function (value) {
      const rootValues = getRootValues(this);
      const rules = buildGeneralInfoRules(rootValues, this.parent);
      const isVisible = !rules.hide.has("futureChildBl");
      const effectiveValue = getEffectiveFieldValue(
        "futureChildBl",
        value,
        rules,
      );

      if (!isVisible) return true;
      return effectiveValue === "Yes" || effectiveValue === "No";
    },
  ),

  /* ---------------- Transhipment (business rule, not UI rule) ---------------- */
  portOfTranshipment: Yup.string().when("movementType", {
    is: "TRANSHIPMENT",
    then: (schema) => schema.required("Port of Transhipment is required"),
    otherwise: (schema) => schema.notRequired().strip(),
  }),

  /* ---------------- Amendment / Update ---------------- */
  actionCode: Yup.string().nullable(),

  amendmentType: Yup.string().when("actionCode", {
    is: (v) => v === "U" || v === "C",
    then: (schema) => schema.required("Amendment Type is required"),
    otherwise: (schema) => schema.notRequired().strip(),
  }),

  filingRemarks: Yup.string().when("actionCode", {
    is: (v) => v === "U" || v === "C",
    then: (schema) =>
      schema
        .required("Filing Remarks are required")
        .max(512, "Filing Remarks must not exceed 512 characters"),
    otherwise: (schema) => schema.notRequired().strip(),
  }),

  filingAttachments: Yup.array().when("actionCode", {
    is: (v) => v === "U" || v === "C",
    then: (schema) =>
      schema
        .of(
          Yup.object({
            sno: Yup.number().required(),
            documentType: Yup.string().required("Document Type is required"),
            referenceNo: Yup.string().required("Reference No is required"),
            file: Yup.mixed()
              .required("Attachment file is required")
              .test(
                "fileFormat",
                "Only jpeg, jpg, png, pdf files are allowed",
                (value) => {
                  if (!value) return false;
                  if (isRemoteAttachmentFile(value)) return true;

                  return [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "application/pdf",
                  ].includes(value.type);
                },
              )
              .test("fileSize", "File size should not exceed 10MB", (value) => {
                if (!value) return false;
                if (isRemoteAttachmentFile(value)) return true;

                return value.size <= 10 * 1024 * 1024;
              }),
            protectedOrUnprotected: Yup.string().required(),
          }),
        )
        .notRequired(),
    otherwise: (schema) => schema.notRequired().strip(),
  }),

  /* ---------------- Optional ---------------- */
  emirate: Yup.string().nullable(),
  remarks: Yup.string()
    .concat(specialCharValidation("remarks"))
    .nullable()
    .max(512, "Remarks must not exceed 512 characters"),
  placeOfBillIssueName: Yup.string().nullable(),
  placeOfFreightPaymentName: Yup.string().nullable(),
  freightPaymentType: Yup.string().nullable(),
  currencyName: Yup.string().when("invoiceAmount", {
    is: (value) => hasMeaningfulValue(value),
    then: (schema) => schema.required("Currency is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  serviceRequirement: Yup.string().nullable(),

  blDate: Yup.date().nullable().typeError("Invalid BL Date"),

  invoiceAmount: Yup.string()
    .nullable()
    .transform((_, originalValue) => {
      if (originalValue === null || originalValue === undefined) {
        return null;
      }

      const normalized = String(originalValue).trim();

      return normalized === "" ? null : normalized;
    })

    // Numeric format
    // Allows:
    // 123
    // 123.4
    // 123.45
    //
    // Rejects:
    // 123.
    // 123.456
    // abc
    .test(
      "invoice-amount-numeric",
      "Invoice Amount must be a valid number with up to 2 decimal places",
      (value) => {
        if (!value) return true;

        return /^\d+(\.\d{1,2})?$/.test(value);
      },
    )

    // Maximum 15 digits before decimal
    .test(
      "invoice-amount-integer-length",
      "Invoice Amount must not exceed 15 digits before the decimal",
      (value) => {
        if (!value) return true;

        const [integerPart] = value.split(".");

        return integerPart.length <= 15;
      },
    ),
});
