import * as Yup from "yup";

export const createGeneralInfoSchema = (requireEfsAgentName = true) =>
  Yup.object({
    actionCode: Yup.string().required("Action Code is required"),
    filingfor: Yup.string().required("Filing For is required"),
    filingType: Yup.string().required("Filing Type is required"),
    efsAgentNameField: requireEfsAgentName
      ? Yup.string().trim().required("Origin Agent is required")
      : Yup.string().trim().nullable(),
  });

export const generalInfoSchema = createGeneralInfoSchema();
