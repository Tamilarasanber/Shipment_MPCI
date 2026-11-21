import * as Yup from "yup";
import {
  specialCharValidation,
  withAllowedSpecialChars,
} from "./specialCharValidation";

const defaultFieldNames = {
  containerNo: "containerNo",
  containerCode: "containerCode",
  containerStatus: "containerStatus",
  shipperSeal: "shipperSeal",
  shipperSealType: "shipperSealType",
  carrierSeal: "carrierSeal",
  carrierSealType: "carrierSealType",
  customsSeal: "customsSeal",
  customsSealType: "customsSealType",
  sealGroup: "sealGroup",
  sealingPartyName: "sealingPartyName",
  reeferCargo: "reeferCargo",
  temperature: "temperature",
  unitCode: "unitCode",
  dangerousGoods: "dangerousGoods",
  packageTypeName: "packageTypeName",
  numberOfPackages: "numberOfPackages",
  removeContainerSplit: "removeContainerSplit",
  newSplitBlNumber: "newSplitBlNumber",
  newParentBlNumber: "newParentBlNumber",
  newVesselName: "newVesselName",
  newVoyageNumber: "newVoyageNumber",
  weight: "weight",
};

const buildContainerNoSchema = (fieldName, mode) => {
  if (mode === "array") {
    return Yup.array()
      .of(
        Yup.string().matches(
          /^[A-Z]{4}[0-9]{7}$/,
          "Please enter a valid container number Ex: ABCD7676561.",
        ),
      )
      .min(1, "Container No. is required")
      .required("Container No. is required");
  }

  return Yup.string()
    .required("Container No. is required")
    .matches(
      /^[A-Z]{4}[0-9]{7}$/,
      "Please enter a valid container number Ex: ABCD7676561.",
    );
};

export const buildContainerDetailsSchema = ({
  isContainerCodeRequired = true,
  fieldNames = {},
  containerNoMode = "string",
} = {}) => {
  const names = {
    ...defaultFieldNames,
    ...fieldNames,
  };

  return Yup.object()
    .shape({
      [names.containerNo]: buildContainerNoSchema(
        names.containerNo,
        containerNoMode,
      ),

      [names.containerCode]: isContainerCodeRequired
        ? Yup.string().required("Container Code is required")
        : Yup.string().nullable(),

      [names.containerStatus]: Yup.string().required(
        "Container Status is required",
      ),

      [names.shipperSeal]: withAllowedSpecialChars(
        Yup.string()
          .transform((value) => (value === "" ? null : value))
          .nullable()
          .trim()
          .max(35, "Shipper Seal must not exceed 35 characters"),
        "Shipper Seal",
      ),

      [names.carrierSeal]: withAllowedSpecialChars(
        Yup.string()
          .transform((value) => (value === "" ? null : value))
          .nullable()
          .trim()
          .max(35, "Carrier Seal must not exceed 35 characters"),
        "Carrier Seal",
      ),

      [names.customsSeal]: withAllowedSpecialChars(
        Yup.string()
          .transform((value) => (value === "" ? null : value))
          .nullable()
          .trim()
          .max(35, "Customs Seal must not exceed 35 characters"),
        "Customs Seal",
      ),

      [names.shipperSealType]: Yup.string().nullable(),
      [names.carrierSealType]: Yup.string().nullable(),
      [names.customsSealType]: Yup.string().nullable(),

      [names.sealingPartyName]: Yup.string()
        .transform((value) => (value === "" ? null : value))
        .trim()
        .max(50, "Sealing Party Name must not exceed 50 characters")
        .concat(specialCharValidation("Sealing Party Name"))
        .when(names.customsSeal, {
          is: (value) => Boolean(value?.trim()),
          then: (schema) => schema.required("Sealing Party Name is required"),
          otherwise: (schema) => schema.nullable(),
        }),

      [names.packageTypeName]: Yup.string().nullable(),

      [names.numberOfPackages]: Yup.string()
        .trim()
        .transform((value) => (value === "" ? null : value))
        .nullable()
        .max(8, "Number of Packages must not exceed 8 digits")
        .matches(/^\d+$/, {
          message: "Number of Packages must contain only digits",
          excludeEmptyString: true,
        }),

      [names.removeContainerSplit]: Yup.string().nullable(),

      [names.newSplitBlNumber]: Yup.string()
        .transform((value) => (value === "" ? null : value))
        .nullable()
        .trim()
        .max(20, "New Split BL Number must not exceed 20 characters"),

      [names.newParentBlNumber]: Yup.string()
        .transform((value) => (value === "" ? null : value))
        .nullable()
        .trim()
        .max(20, "New Parent BL Number must not exceed 20 characters"),

      [names.newVesselName]: Yup.string()
        .transform((value) => (value === "" ? null : value))
        .nullable()
        .trim()
        .max(70, "New Vessel Name must not exceed 70 characters"),

      [names.newVoyageNumber]: Yup.string()
        .transform((value) => (value === "" ? null : value))
        .nullable()
        .trim()
        .max(17, "New Voyage Number must not exceed 17 characters"),

      [names.reeferCargo]: Yup.boolean(),
      [names.dangerousGoods]: Yup.boolean(),

      [names.temperature]: Yup.string()
        .transform((value) => (value === "" ? null : value))
        .nullable()
        .max(15, "Temperature must not exceed 15 characters")
        .when(names.reeferCargo, {
          is: true,
          then: (schema) =>
            schema.required("Temperature is required for Reefer Cargo"),
          otherwise: (schema) => schema.notRequired(),
        }),

      [names.unitCode]: Yup.string()
        .transform((value) => (value === "" ? null : value))
        .nullable()
        .when(names.reeferCargo, {
          is: true,
          then: (schema) =>
            schema.required("Unit Code is required for Reefer Cargo"),
          otherwise: (schema) => schema.notRequired(),
        }),

      [names.weight]: Yup.string()
        .nullable()
        .transform((_, originalValue) => {
          if (originalValue === null || originalValue === undefined) {
            return null;
          }

          const normalizedValue = String(originalValue).trim();

          return normalizedValue === "" ? null : normalizedValue;
        })

        // VGM Weight format:
        // - 1 to 14 digits before decimal
        // - Decimal part is optional
        // - If decimal is present, 1 to 3 digits are allowed
        // - Maximum valid value format:
        //   99999999999999.999
        .test(
          "vgm-weight-format",
          "VGM Weight must contain up to 14 digits before the decimal and up to 3 decimal places",
          (value) => {
            if (!value) return true;

            return /^\d{1,14}(\.\d{1,3})?$/.test(value);
          },
        ),
    })
    .test(
      "at-least-one-seal",
      "At least one of Shipper Seal, Carrier Seal or Customs Seal is required",
      function testAtLeastOneSeal(container = {}) {
        const hasAtLeastOneSeal = [
          names.shipperSeal,
          names.carrierSeal,
          names.customsSeal,
        ].some((fieldName) => String(container?.[fieldName] ?? "").trim());

        if (hasAtLeastOneSeal) return true;

        return this.createError({
          path: this.path ? `${this.path}.${names.sealGroup}` : names.sealGroup,
          message:
            "At least one of Shipper Seal, Carrier Seal or Customs Seal is required",
        });
      },
    );
};

export const containerDetailsSchema = buildContainerDetailsSchema({
  containerNoMode: "array",
});
