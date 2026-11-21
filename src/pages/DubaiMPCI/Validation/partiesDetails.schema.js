import * as Yup from "yup";
import { specialCharValidation } from "./specialCharValidation";

const CONTACT_PARTY_TYPES_REQUIRING_DETAILS = ["INDIVIDUAL", "COMPANY"];

const ALLOWED_SPECIAL_CHARS_REGEX =
  /^[A-Za-z0-9 \r\n,+\-$#@%&!'`^_:;.?\[\]{}\/='|]*$/;

const requiresContactDetails = (partyType, contactPartyType) =>
  partyType === "Consignee" &&
  CONTACT_PARTY_TYPES_REQUIRING_DETAILS.includes(contactPartyType);

const hasTextValue = (value) => Boolean(String(value ?? "").trim());
const PARTY_CORE_FIELDS = ["partyName", "address", "cityName", "countryName"];

const hasAnyCorePartyDetail = (party = {}) =>
  PARTY_CORE_FIELDS.some((field) => hasTextValue(party[field]));

const isCorePartyFieldRequired = (party = {}, isConsigneeRequired) =>
  party.partyType !== "Consignee" ||
  isConsigneeRequired ||
  hasAnyCorePartyDetail(party);

const corePartyField = (label, isConsigneeRequired, maxLength) => {
  let schema = Yup.string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .trim();

  if (maxLength) {
    schema = schema.max(
      maxLength,
      `${label} must not exceed ${maxLength} characters`,
    );
  }

  return schema.test(
    `${label.toLowerCase().replace(/\s+/g, "-")}-required`,
    `${label} is required`,
    function (value) {
      if (!isCorePartyFieldRequired(this.parent || {}, isConsigneeRequired)) {
        return true;
      }
      return hasTextValue(value);
    },
  );
};

export const buildPartyDetailsSchema = ({ isConsigneeRequired = true } = {}) =>
  Yup.object().shape({
  partyType: Yup.string().required(),

  /* ---------------- Required Fields ---------------- */

  partyName: corePartyField("Entity Name", isConsigneeRequired, 70).concat(
    specialCharValidation("Entity Name"),
  ),

  address: corePartyField("Address", isConsigneeRequired, 256).concat(
    specialCharValidation("Address"),
  ),

  cityName: corePartyField("City", isConsigneeRequired, 35).concat(
    specialCharValidation("City"),
  ),

  // stateName: Yup.string().when("partyType", {
  //   is: (partyType) => partyType === "Consignee" && !isConsigneeRequired,
  //   then: (schema) => schema.notRequired(),
  //   otherwise: (schema) => schema.required("State is required"),
  // }),
  stateName: Yup.string()
  .trim()
  .nullable()
  .notRequired()
  .max(35, "State must not exceed 35 characters")
  .concat(specialCharValidation("State")),

  countryName: corePartyField("Country", isConsigneeRequired),

  poBox: Yup.string()
  .nullable()
  .max(9, "PO Box must not exceed 9 characters")
  .concat(specialCharValidation("PO Box")),

  contactDetail: Yup.string()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .trim()
  .max(35, "Contact Name must not exceed 35 characters")
  .concat(specialCharValidation("Contact Name"))
  .test(
    "contact-detail-required",
    "Contact Name is required",
    function (value) {
      const { partyType, contactPartyType, mobile, email } = this.parent || {};
      if (partyType !== "Consignee") return true;

      const requiresFromPartyType = requiresContactDetails(
        partyType,
        contactPartyType,
      );
      const requiresFromContactInfo =
        hasTextValue(mobile) || hasTextValue(email);

      if (!requiresFromPartyType && !requiresFromContactInfo) {
        return true;
      }

      return hasTextValue(value);
    },
  ),

  /* ---------------- Optional but Validated If Provided ---------------- */

  taxID: Yup.string()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .max(35, "Tax ID must not exceed 35 characters")
  .concat(specialCharValidation("Tax ID")),

  qualifier: Yup.string()
  .nullable()
  .max(35, "Qualifier must not exceed 35 characters")
  .test(
    "qualifier-required",
    "Qualifier is required",
    function (value) {
      const { partyType, identifierNo } = this.parent || {};
      if (partyType !== "Consignee") return true;
      return !(identifierNo && !value);
    },
  ),

identifierNo: Yup.string()
  .nullable()
  .max(35, "Identifier must not exceed 35 characters")
  .concat(specialCharValidation("Identifier"))
  .test(
    "identifier-required",
    "Identifier is required",
    function (value) {
      const { partyType, qualifier } = this.parent || {};
      if (partyType !== "Consignee") return true;
      return !(qualifier && !value);
    },
  ),

  contactPartyType: Yup.string()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .test(
      "contact-party-type-required",
      "Contact Party Type is required",
      function (value) {
        const { partyType, contactDetail } = this.parent || {};
        if (partyType !== "Consignee") return true;
        if (!hasTextValue(contactDetail)) return true;
        return hasTextValue(value);
      },
    ),

  mobile: Yup.string()
  .transform((value, originalValue) => {
    const raw = String(originalValue ?? "").trim();
    if (!raw) return null;
    return raw;
  })
  .nullable()
  .max(35, "Phone Number must not exceed 35 characters")
  .matches(/^\d*$/, {
    message: "Phone Number must contain only numbers",
    excludeEmptyString: true,
  })
  .when("partyType", {
    is: "Consignee",
    then: (schema) =>
      schema.test(
        "mobile-or-email-required",
        "Phone Number or Email ID is required",
        function (value) {
          const { partyType, contactPartyType, contactDetail, email } =
            this.parent || {};
          if (
            partyType !== "Consignee" ||
            !(
              requiresContactDetails(partyType, contactPartyType) ||
              hasTextValue(contactDetail)
            )
          ) {
            return true;
          }

          return Boolean(value || email);
        },
      ),
    otherwise: (schema) => schema.notRequired().strip(),
  }),

  email: Yup.string()
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .max(512, "Email ID must not exceed 512 characters")
    .email("Invalid Email ID")
    .when("partyType", {
      is: "Consignee",
      then: (schema) =>
        schema.test(
          "email-or-mobile-required",
          "Email ID or Phone Number is required",
          function (value) {
            const { partyType, contactPartyType, contactDetail, mobile } =
              this.parent || {};
            if (
              partyType !== "Consignee" ||
              !(
                requiresContactDetails(partyType, contactPartyType) ||
                hasTextValue(contactDetail)
              )
            ) {
              return true;
            }

            return Boolean(value || mobile);
          },
        ),
      otherwise: (schema) => schema.notRequired().strip(),
    }),
});

export const partyDetailsSchema = buildPartyDetailsSchema();
