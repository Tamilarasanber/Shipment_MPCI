import * as Yup from "yup";
import { createGeneralInfoSchema } from "./generalInfo.schema";
import { jobDetailsSchema } from "./jobDetails.schema";
import { hblSchema } from "./hbl.schema";

export const createDubaiFilingSchema = ({ requireEfsAgentName = true } = {}) =>
  Yup.object({
    ...createGeneralInfoSchema(requireEfsAgentName).fields,
    ...jobDetailsSchema.fields,
    hblList: Yup.array()
      .of(hblSchema)
      .min(1, "At least one HBL required")
      .required("HBL is required"),
  });

export const dubaiFilingSchema = createDubaiFilingSchema();
