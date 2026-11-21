import { httpInstance } from "@/configs/http";
import { buildPostHeaderPayload } from "@/pages/DubaiMPCI/MapperLayer/mpciMapper";
import { normalizeMpciMasterOptions } from "@/pages/DubaiMPCI/MapperLayer/DubaiMPCIMasterFormatters";
import {
  buildContainerHeaderIndex,
  buildContainerHeaderOptions,
} from "@/pages/DubaiMPCI/utils/containerHeaderUtils";

// Dubai MPCI Filing Save and Submit APIs
const BASE_FILING_URL = "uae-mpci/filing";

const normalizeApiEnvelope = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (payload?.data !== undefined) {
    return payload.data;
  }

  if (payload?.result !== undefined) {
    return payload.result;
  }

  return payload;
};

const getMasterIdFromApiPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload[0]?.masterId ?? payload[0]?.id ?? null;
  }

  return (
    payload?.masterId ??
    payload?.id ??
    payload?.data?.masterId ??
    payload?.data?.id ??
    payload?.result?.masterId ??
    payload?.result?.id ??
    null
  );
};

export const saveFilingApi = async (payload) => {
  try {
    const postHeader = buildPostHeaderPayload(payload, payload?.loginUserData);

    const masterId =
      payload?.masterId ?? payload?.formData?.masterId ?? postHeader?.masterId;

    const isUpdate = Boolean(masterId);

    const endpoint = isUpdate
      ? `${BASE_FILING_URL}/${masterId}`
      : BASE_FILING_URL;

    const method = isUpdate ? "put" : "post";

    const response = await httpInstance[method](endpoint, postHeader);

    const rawResponseData = response?.data || {};

    const responseStatus = Number(rawResponseData?.status);

    const responseMessage =
      rawResponseData?.message || rawResponseData?.error?.message;

    // API business error
    if (!Number.isFinite(responseStatus) || responseStatus !== 200) {
      throw new Error(
        responseMessage || `Unable to ${isUpdate ? "update" : "save"} filing`,
      );
    }

    const normalizedPayload = normalizeApiEnvelope(response);

    const resolvedMasterId = getMasterIdFromApiPayload(normalizedPayload);

    return {
      status: responseStatus,
      message: responseMessage || "",
      rows: Array.isArray(normalizedPayload) ? normalizedPayload : [],
      masterId: resolvedMasterId,
      id: resolvedMasterId,
      raw: rawResponseData,
    };
  } catch (error) {
    console.error("Save Filing API Error:", error);

    // Axios HTTP error response
    const apiErrorData = error?.response?.data;

    const apiErrorMessage =
      apiErrorData?.message || apiErrorData?.error?.message || error?.message;

    // Preserve actual backend message
    throw new Error(
      apiErrorMessage ||
        `Unable to ${payload?.masterId ? "update" : "save"} filing`,
    );
  }
};

export const submitFilingApi = async (payload) => {
  // console.log("Submitting filing:", payload);
  try {
    const postHeader = buildPostHeaderPayload(payload, payload?.loginUserData);
    const masterId =
      payload?.masterId ?? payload?.formData?.masterId ?? postHeader?.masterId;
    const normalizedBlIds = Array.isArray(payload?.blIds)
      ? payload.blIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && id > 0)
      : [];
    const blIds = normalizedBlIds.join(",");

    const response = await httpInstance.post("mpci/submitMpci", postHeader, {
      params: {
        masterId,
        blIds,
      },
    });

    const rawResponseData = response?.data || {};
    const responseStatus = Number(rawResponseData?.status);
    const responseData = rawResponseData?.data || "";
    const responseMessage =
      rawResponseData?.message ||
      rawResponseData?.error?.message ||
      "Unable to submit filing";

    // HTTP/API status validation
    if (!Number.isFinite(responseStatus) || responseStatus !== 200) {
      throw new Error(responseMessage);
    }
    // Business validation
    if (
      typeof responseData === "string" &&
      responseData.trim().startsWith("Failure")
    ) {
      throw new Error("Failed to submit filing");
    }

    return {
      status: responseStatus,
      message: rawResponseData?.message || "",
      raw: rawResponseData,
    };
  } catch (error) {
    console.error("Submit Filing API Error:", error);
    throw error;
  }
};

// Dubai MPCI Status
export function fetchStatusListApi({ masterId }) {
  return httpInstance.get("mpci/getCurrentStatus", {
    params: { masterId },
  });
}

// Dubai MPCI SubmissionHistory
export function fetchSubmissionHistoryApi({ masterId }) {
  return httpInstance.get("mpci/getSubmissionHistory", {
    params: { masterId },
  });
}
// getBookingList from Dubai MPCI table row
export function fetchAgentMPCIRowsService({ payload }) {
  return httpInstance.get("uae-mpci/filing/list", { params: payload });
}

// Dubai MPCI Download Excel Dashboard
export function downloadAgentMPCIRowsService({ payload }) {
  return httpInstance.get("uae-mpci/filing/list", {
    params: {
      ...payload,
      isDownload: true,
    },
    responseType: "blob",
  });
}
// Common request for all dropdowns
const MPCI_MASTER_REQUEST_BUILDERS = {
  CARRIER: ({ searchText }) =>
    httpInstance.get(`/mpci/getCarrierList?carrierName=${searchText}`),
  VESSEL: ({ searchText }) =>
    httpInstance.get(`/mpci/getVesselList?vesselName=${searchText}`),
  COUNTRY: ({ searchText }) =>
    httpInstance.get(`/mpci/getCountryList?countryName=${searchText}`),
  STATE: ({ searchText }) =>
    httpInstance.get(`/mpci/getStateList?stateName=${searchText}`),
  CITY: ({ searchText }) =>
    httpInstance.get(`/mpci/getCityList?cityName=${searchText}`),
  CONTAINER: ({ searchText }) =>
    httpInstance.get(`/mpci/getContainerList?containerName=${searchText}`),
  HS_CODE: ({ searchText }) =>
    httpInstance.get(`/mpci/getHsCodeList?hsCodeName=${searchText}`),
  CURRENCY: ({ searchText }) =>
    httpInstance.get(`/mpci/getCurrencyList?currency=${searchText}`),
  MAKING_INSTRUCTION: () =>
    httpInstance.get("/mpci/getMarkingInstructionList?markingInstruction"),
  PACKING_DESC_CODE: () =>
    httpInstance.get("/mpci/getPackageDescriptionList?description"),
  PACKAGE_TYPE: () => httpInstance.get("/mpci/getPackageTypeList?packageType"),
  PORTNAME: ({ searchText, transportMode }) => {
    const query = `portName=${searchText}`;
    const modeQuery = transportMode ? `&transportMode=${transportMode}` : "";
    return httpInstance.get(`/sailingSchedule/getPortList?${query}${modeQuery}`);
  },
  HANDLINGINSTRUCTION: () =>
    httpInstance.get("/mpci/getHandlingInstructionList?instructioString"),
  EFSAGENTNAME: ({ role, filter }) =>
    httpInstance.get("/uae-mpci/agents", {
      params: {
        ...(role ? { role } : {}),
        ...(filter ? { filter } : {}),
      },
    }),
};

export const getMpciMasterList = async ({
  type,
  searchText,
  countryId,
  stateId,
  role,
  filter,
  transportMode,
}) => {
  const requestBuilder = MPCI_MASTER_REQUEST_BUILDERS[type];
  if (typeof requestBuilder !== "function") {
    return null;
  }

  const response = await requestBuilder({
    searchText,
    countryId,
    stateId,
    role,
    filter,
    transportMode,
  });

  return {
    ...response,
    data: normalizeMpciMasterOptions(type, response?.data),
  };
};

// Dubai MPCI Party Lookup Service parties like auto fill party name
export const fetchMpciPartyLookupService = ({ partyName }) =>
  httpInstance.get("uae-mpci/party-lookup", {
    params: { partyName },
  });

// Dubai MPCI HBL List for a given masterId
export function fetchAgentMPCIhblList({ payload }) {
  return httpInstance.get("mpci/getMPCIHBLList", { params: payload });
}

// Link HBL
export function fetchMPCIhbllLink(payload = {}) {
  return httpInstance.get("mpci/getHblDetails", { params: payload });
}
// Dubai MPCI Filing details for a given masterId
export function fetchMPCIDetailsService({ masterId }) {
  return httpInstance.get("uae-mpci/getFiling", {
    params: { masterId },
  });
}
// Dubai MPCI Preview API
export function fetchMPCIPreviewApi({ masterId, blIds }) {
  return httpInstance.get("mpci/getMpciPreview", {
    params: {
      masterId,
      blIds,
    },
    responseType: "blob",
  });
}

// Attahement Update
const buildAttachmentFormData = (payload = {}) => {
  const formData = new FormData();

  const attachment = {
    protectedOrUnprotected: payload?.protectedOrUnprotected || "Unprotected",
    documentType: payload?.documentType || "",
    referenceNo: payload?.referenceNo || "",
    blId: payload?.blId || "",
    headerId: payload?.headerId || "",
    createdUser: payload?.createdUser || "",
    updatedUser: payload?.updatedUser || "",
  };

  formData.append(
    "attachment",
    new Blob([JSON.stringify(attachment)], { type: "application/json" }),
  );

  if (payload?.file) {
    formData.append("file", payload.file);
  }

  return formData;
};

export const uploadMPCIAttachmentApi = async (payload = {}) => {
  const formData = buildAttachmentFormData(payload);
  return httpInstance.post("/mpci/attachments", formData);
};

// Attahement GET
export const fetchMPCIAttachmentsByBlApi = ({ blId }) => {
  return httpInstance.get(`mpci/attachments/bl/${blId}`);
};

// Attahement delete
export const deleteMPCIAttachmentApi = ({ attachmentId }) =>
  httpInstance.delete(`mpci/attachments/${attachmentId}`);

// Attahement put
export const updateMPCIAttachmentApi = async (payload = {}) => {
  const attachmentId = Number(payload?.attachmentId);
  const formData = buildAttachmentFormData(payload);
  return httpInstance.put(`mpci/attachments/${attachmentId}`, formData);
};

// Container Headers Save Service
export const saveMpciContainerHeadersService = async (payload = {}) => {
  const headers = Array.isArray(payload?.headers) ? payload.headers : [];

  return {
    data: headers,
    options: buildContainerHeaderOptions(headers),
    indexByContainerNo: buildContainerHeaderIndex(headers),
  };
};

// Dubai MPCI Filing Excel Template Download API
export const downloadMpciTemplateApi = (download) =>
  httpInstance.get("uae-mpci/download-mpci-template", {
    params: { download },
    responseType: "blob",
  });

// Dubai MPCI Excel Upload API and Error Report, With Validation and With Validation
const MPCI_EXCEL_UPLOAD_URL = "uae-mpci/upload-mpci-excel";
const MPCI_ERROR_REPORT_DOWNLOAD_URL = "uae-mpci/validation-errors/download";

const buildMpciExcelUploadMessage = ({
  totalHbls,
  validHbls,
  errorHbls,
  hblsCreated,
}) => {
  if (totalHbls === 0) {
    return "No HBLs were found in the uploaded file. Please upload a valid file and try again.";
  }

  if (errorHbls > 0) {
    return `${validHbls} of ${totalHbls} HBLs passed validation. ${errorHbls} require correction. You can proceed with ${validHbls} validated HBLs now, or fix all errors and re-upload for full compliance.`;
  }

  if (hblsCreated > 0) {
    return `${hblsCreated} HBLs were created successfully from the uploaded file.`;
  }

  return `All ${validHbls ?? totalHbls} HBLs passed validation successfully.`;
};

const normalizeMpciValidationError = (error = {}, index = 0) => ({
  id:
    error?.id ??
    `${error?.hblNo || "mpci"}-${error?.sheet || "sheet"}-${error?.field || "field"}-${index}`,
  sheet: error?.sheet || "-",
  hblNo: error?.hblNo || "-",
  row: error?.row ?? "-",
  field: error?.field || "-",
  // type: error?.error || error?.type || "Validation Error",
  message: error?.error || "_",
  // invalidValue: error?.invalidValue ?? null,
});

export const normalizeMpciExcelValidationSummary = (
  responseData = {},
  fileName = "",
) => {
  const payload = responseData?.data || responseData || {};
  const validationErrors = Array.isArray(payload?.validationErrors)
    ? payload.validationErrors
    : [];
  const normalizedErrors = validationErrors.map(normalizeMpciValidationError);
  const totalHbls = Number(payload?.totalHbls) || 0;
  const validHbls = Number(payload?.validRecords) || 0;
  const errorHbls = Number(payload?.recordsWithIssues) || 0;
  const hblsCreated = Number(payload?.hblsCreated) || 0;

  const validShipments = Array.isArray(payload?.validShipments)
    ? payload.validShipments
    : [];
  const invalidShipments = Array.isArray(payload?.invalidShipments)
    ? payload.invalidShipments
    : [];
  const masterContainerDetails = Array.isArray(payload?.masterContainerDetails)
    ? payload.masterContainerDetails
    : [];
  const allShipments = [...validShipments, ...invalidShipments];

  return {
    requestId: payload?.requestId || "",
    fileName,
    totalHbls,
    validHbls,
    warningHbls: 0,
    errorHbls,
    totalErrors: normalizedErrors.length,
    hblsCreated,
    errors: normalizedErrors,
    masterContainerDetails,
    validShipments,
    invalidShipments,
    allShipments,
    message:
      payload?.message ||
      buildMpciExcelUploadMessage({
        totalHbls,
        validHbls,
        errorHbls,
        hblsCreated,
      }),
  };
};

export const buildValidShipmentsIndex = (validShipments = []) => {
  const byUniqueId = {};

  (Array.isArray(validShipments) ? validShipments : []).forEach((shipment) => {
    const uniqueId = String(shipment?.uniqueId ?? "").trim();
    if (!uniqueId) return;
    byUniqueId[uniqueId] = shipment;
  });

  return byUniqueId;
};

export const buildMpciShipmentsIndex = (shipments = []) => {
  const byUniqueId = {};

  (Array.isArray(shipments) ? shipments : []).forEach((shipment) => {
    const uniqueId = String(shipment?.uniqueId ?? "").trim();
    if (!uniqueId) return;
    byUniqueId[uniqueId] = shipment;
  });

  return byUniqueId;
};

export const validateMpciExcelApi = async ({ file }) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await httpInstance.post(MPCI_EXCEL_UPLOAD_URL, formData);
  const rawResponseData = response?.data || {};
  const responseStatus = Number(rawResponseData?.status);
  const responseMessage =
    rawResponseData?.message ||
    rawResponseData?.error?.message ||
    "Unable to validate MPCI Excel file";

  if (!Number.isFinite(responseStatus) || responseStatus !== 200) {
    throw new Error(responseMessage);
  }

  return {
    ...response,
    data: normalizeMpciExcelValidationSummary(
      rawResponseData,
      file?.name || "",
    ),
  };
};

// Dubai MPCI Error Report Download API
export const downloadMpciErrorReportApi = async (payload = {}) => {
  const requestId = String(payload?.requestId || "").trim();

  if (!requestId) {
    throw new Error("requestId is required to download MPCI error report");
  }

  return httpInstance.get(MPCI_ERROR_REPORT_DOWNLOAD_URL, {
    params: {
      requestId,
    },
    responseType: "blob",
  });
};

export const proceedMpciValidatedHblsApi = async ({
  validShipments = [],
} = {}) => {
  return {
    data: {
      validShipments,
    },
  };
};

export const proceedMpciAllHblsApi = async ({ shipments = [] } = {}) => {
  return {
    data: {
      shipments,
    },
  };
};

// HBL PDF/Image (Gemini) extraction — one file per call.
// Endpoint: POST /api/uae-mpci/hbl/extract-from-pdf (multipart, field name "file").
// The controller always returns HTTP 200; the per-file outcome is in data.status
// ("success" | "failed"). Shared by the PDF extraction flow only (not Excel).
const MPCI_PDF_EXTRACT_URL = "uae-mpci/hbl/extract-from-pdf";

export const extractFromPdfApi = async ({ file }) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await httpInstance.post(MPCI_PDF_EXTRACT_URL, formData);
  const rawResponseData = response?.data || {};
  const responseStatus = Number(rawResponseData?.status);
  const responseMessage =
    rawResponseData?.message ||
    rawResponseData?.error?.message ||
    "Unable to extract data from the uploaded file";

  // Transport / access failure (e.g. 403 feature gate) — surfaced as a thrown error.
  if (!Number.isFinite(responseStatus) || responseStatus !== 200) {
    throw new Error(responseMessage);
  }

  // Inner PdfExtractionResponse: { sourceFileName, status, reviewData, errors, usage }.
  // A per-file "failed" status is a normal return so the caller can mark that file.
  return rawResponseData?.data || {};
};
