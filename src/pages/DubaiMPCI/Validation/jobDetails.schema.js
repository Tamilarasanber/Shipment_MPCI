import * as Yup from "yup";
import { buildContainerDetailsSchema } from "./containerDetails.schema";

export const jobDetailsSchema = Yup.object({
  carrierName: Yup.string().required("Carrier is required"),
  mblNo: Yup.string()
    .max(20, "MBL Number must not exceed 20 characters")
    .required("MBL Number is required"),
  firstPortLoadingName: Yup.string().required("First Port of Loading is required"),
  cargoType: Yup.string().required("CargoType is required"),
  lastForeignPortName: Yup.string().required("Last Foreign Port is required"),
  portOfDischargeName: Yup.string().required("Port of Discharge is required"),
  vesselCountryName: Yup.string().required("Vessel Country is required"),
  vesselName: Yup.string()
  .required("Vessel Name is required"),
  voyageNo: Yup.string()
    .max(20, "Voyage Number must not exceed 20 characters")
    .required("Voyage Number is required"),
  filingPartyMpciID: Yup.string()
    .max(7, "Filing Party MPCI ID must not exceed 7 characters")
    .required("Filing Party MPCI is required"),
  liablePartyMpciId: Yup.string()
    .max(7, "Liable UAE Party MPCI ID must not exceed 7 characters")
    .when(["filingfor", "filingType"], {
      is: (filingfor, filingType) =>
        filingfor === "On behalf of Partner UAE Freight Forwarder" &&
        ["FF", "MCL", "SCL"].includes(filingType),
      then: (schema) => schema.required("Liable UAE Party MPCI ID is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  eta: Yup.date()
    .nullable()
    .typeError("ETA Date is required")
    .required("ETA Date is required"),
  // etd: Yup.date()
  //   .nullable()
  //   .typeError("ETD Date is required")
  //   .required("ETD Date is required")
  //   .test(
  //     "etd-before-eta",
  //     "ETD Date must be earlier than or equal to ETA Date",
  //     function (etd) {
  //       const { eta } = this.parent;
  //       if (!etd || !eta) return true;
  //       return new Date(etd) <= new Date(eta);
  //     },
  //   ),
  etd: Yup.date()
  .nullable()
  .notRequired()
  .typeError("Invalid ETD Date"),

  containerHeaders: Yup.array()
    .of(
      buildContainerDetailsSchema({
        containerNoMode: "string",
        fieldNames: {
          containerCode: "containerCodeHeader",
          containerNo: "containerNoHeader",
          containerStatus: "containerStatusHeader",
          shipperSeal: "shipperSealHeader",
          shipperSealType: "shipperSealTypeHeader",
          carrierSeal: "carrierSealHeader",
          carrierSealType: "carrierSealTypeHeader",
          customsSeal: "customsSealHeader",
          customsSealType: "customsSealTypeHeader",
          sealingPartyName: "sealingPartyNameHeader",
          reeferCargo: "reeferCargoHeader",
          temperature: "temperatureHeader",
          unitCode: "unitCodeHeader",
          dangerousGoods: "dangerousGoodsHeader",
        },
      }),
    )
    .test(
      "unique-container-header",
      "Container Code, Container ID and Container No. already exists",
      function testUniqueContainerHeader(containerHeaders = []) {
        const seen = new Set();

        for (let index = 0; index < containerHeaders.length; index += 1) {
          const header = containerHeaders[index] || {};
          const containerCode = String(header.containerCodeHeader ?? "").trim();
          const containerId = String(header.containerIdHeader ?? "").trim();
          const containerNo = String(header.containerNoHeader ?? "").trim();

          if (!containerCode || !containerId || !containerNo) continue;

          const duplicateKey = `${containerCode}|${containerId}|${containerNo}`;

          if (seen.has(duplicateKey)) {
            return this.createError({
              path: `${this.path}.${index}.containerNoHeader`,
              message:
                "This container already exists with the same Code, ID and No.",
            });
          }

          seen.add(duplicateKey);
        }

        return true;
      },
    )
    .min(1, "At least one container header is required")
    .required("Container headers are required"),
});
