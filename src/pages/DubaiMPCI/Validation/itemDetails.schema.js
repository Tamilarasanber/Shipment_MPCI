import * as Yup from "yup";
import { specialCharValidation } from "./specialCharValidation";

const normalizeCommaSeparatedValue = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    .split(",")
    .map((code) => code.trim())
    .join(",");
};

const decimalNumberWithMaxLength = (
  maxLength,
  fieldLabel,
  required = false,
) => {
  let schema = Yup.string()
    .nullable()
    .transform((_, originalValue) => {
      if (originalValue === null || originalValue === undefined) {
        return null;
      }

      const normalized = String(originalValue).trim();

      return normalized === "" ? null : normalized;
    })

    // Decimal validation:
    // - Maximum 14 digits before decimal
    // - Optional decimal part
    // - Maximum 3 digits after decimal
    // - Decimal point cannot exist without decimal digits
    .test(
      `${fieldLabel}-format`,
      `${fieldLabel} must contain up to 14 digits before the decimal and up to 3 decimal places`,
      (value) => {
        if (!value) return true;

        return /^\d{1,14}(\.\d{1,3})?$/.test(value);
      },
    )

    // Value must be greater than zero
    .test(
      `${fieldLabel}-greater-than-zero`,
      `${fieldLabel} must be greater than 0`,
      (value) => {
        if (!value) return true;

        return Number(value) > 0;
      },
    );

  if (required) {
    schema = schema.required(`${fieldLabel} is required`);
  }

  return schema;
};

export const buildItemDetailsSchema = ({
  dangerousGoods = false,
  hsCodeRequired = true,
} = {}) =>
  Yup.object().shape({
    hsCode: (hsCodeRequired
      ? Yup.string().required("HS Code is required")
      : Yup.string().nullable()
    )
      .transform((_, originalValue) =>
        normalizeCommaSeparatedValue(originalValue),
      )
      .matches(/^[0-9,\s]*$/, "Only numbers and commas are allowed")
      .test(
        "valid-hs-codes",
        "Each HS Code must be 6 to 12 digits. Multiple HS Codes should be comma separated without empty values.",
        (value) => {
          if (!value) return true;

          if (
            value.startsWith(",") ||
            value.endsWith(",") ||
            value.includes(",,")
          ) {
            return false;
          }

          const codes = value.split(",");

          if (codes.some((code) => !code.trim())) {
            return false;
          }

          return codes.every((code) => /^\d{6,12}$/.test(code.trim()));
        },
      ),

    containerNo: Yup.array()
      .of(Yup.string())
      .min(1, "At least one Container Number is required")
      .required("Container Number is required"),

    /* ---------------- Packages ---------------- */

    numberOfPackages: Yup.string()
      .transform((v) => (v === "" ? null : v))
      .required("Number of packages is required")
      .matches(/^\d+$/, "Number of Packages must contain only digits")
      .max(8, "Number of Packages must not exceed 8 digits"),

    packageTypeName: Yup.string().required("Package Type is required"),

    /* ---------------- Weights (Invoice Pattern) ---------------- */

    cargoGrossWeight: decimalNumberWithMaxLength(
      18,
      "Cargo Gross Weight (KGM)",
      true,
    ),

    cargoNetWeight: decimalNumberWithMaxLength(18, "Cargo Net Weight (KGM)"),

    volumeMtq: decimalNumberWithMaxLength(18, "Volume (MTQ)"),

    /* ---------------- Item Description ---------------- */


    itemDescription: Yup.string()
      .trim()
      .max(512, "Item Description must not exceed 512 characters")
      .concat(specialCharValidation("Item Description"))
      .required("Item Description is required"),

    marksAndNumbers: Yup.string()
      .trim()
      .max(350, "Marks & Numbers must not exceed 350 characters")
      .concat(specialCharValidation("Marks & Numbers"))
      .required("Marks & Numbers is required"),

    /* ---------------- Dangerous Goods ---------------- */

    imoClass: dangerousGoods
      ? Yup.string().required("IMO Class is required")
      : Yup.string().notRequired(),

    // unCode: dangerousGoods
    //   ? Yup.string()
    //       .max(4, "UN Code must not exceed 4 characters")
    //       .required("UN Code is required")
    //   : Yup.string()
    //       .max(4, "UN Code must not exceed 4 characters")
    //       .notRequired(),
    unCode: Yup.string()
      .nullable()
      .matches(/^\d{4}$/, {
        message: "UN Code must contain exactly 4 digits number",
        excludeEmptyString: true, // allows empty when optional
      })
      .when([], {
        is: () => dangerousGoods,
        then: (schema) => schema.required("UN Code is required"),
      }),

    /* ---------------- Optional ---------------- */

    packingRelatedDescCode: Yup.string().nullable(),
    markingInstructionName: Yup.string().nullable(),
    countryOfOriginName: Yup.string().nullable(),
  });

export const itemDetailsSchema = buildItemDetailsSchema();
