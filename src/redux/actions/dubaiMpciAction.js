import {
  SAVE_FILING_REQUEST,
  SUBMIT_FILING_REQUEST,
  FETCH_STATUS_REQUEST,
  FETCH_SUBMISSION_HISTORY_REQUEST,
  FETCH_AGENT_MPCI_ROWS_REQUEST,
  CHANGE_AGENT_MPCI_DISPLAY_HEADERS,
  DOWNLOAD_AGENT_MPCI_ROWS_REQUEST,
  DOWNLOAD_AGENT_MPCI_ROWS_SUCCESS,
  DOWNLOAD_AGENT_MPCI_ROWS_FAILURE,
  FETCH_MPCI_MASTER_REQUEST,
  FETCH_MPCI_MASTER_SUCCESS,
  FETCH_MPCI_MASTER_FAILURE,
  FETCH_MPCI_PARTY_LOOKUP_REQUEST,
  FETCH_MPCI_PARTY_LOOKUP_SUCCESS,
  FETCH_MPCI_PARTY_LOOKUP_FAILURE,
  CLEAR_MPCI_PARTY_LOOKUP,
  FETCH_AGENT_MPCI_HBL_LIST_REQUEST,
  FETCH_MPCI_DETAILS_REQUEST,
  FETCH_MPCI_DETAILS_SUCCESS, 
  FETCH_MPCI_DETAILS_FAILURE,
  CLEAR_MPCI_DETAILS,
  FETCH_MPCI_LINK_HBL_DETAILS_REQUEST,
  FETCH_MPCI_LINK_HBL_DETAILS_SUCCESS,
  FETCH_MPCI_LINK_HBL_DETAILS_FAILURE,
  UPLOAD_MPCI_ATTACHMENT_REQUEST,
  UPLOAD_MPCI_ATTACHMENT_SUCCESS,
  UPLOAD_MPCI_ATTACHMENT_FAILURE,
  FETCH_MPCI_ATTACHMENTS_BY_BL_REQUEST,
  FETCH_MPCI_ATTACHMENTS_BY_BL_SUCCESS,
  FETCH_MPCI_ATTACHMENTS_BY_BL_FAILURE,
  DELETE_MPCI_ATTACHMENT_REQUEST,
  DELETE_MPCI_ATTACHMENT_SUCCESS,
  DELETE_MPCI_ATTACHMENT_FAILURE,
  UPDATE_MPCI_ATTACHMENT_REQUEST,
  UPDATE_MPCI_ATTACHMENT_SUCCESS,
  UPDATE_MPCI_ATTACHMENT_FAILURE,
  FETCH_MPCI_PREVIEW_REQUEST,
  FETCH_MPCI_PREVIEW_SUCCESS,
  FETCH_MPCI_PREVIEW_FAILURE,
  SAVE_MPCI_CONTAINER_HEADERS_REQUEST,
  SAVE_MPCI_CONTAINER_HEADERS_SUCCESS,
  SAVE_MPCI_CONTAINER_HEADERS_FAILURE,
  DOWNLOAD_MPCI_TEMPLATE_REQUEST,
  DOWNLOAD_MPCI_TEMPLATE_SUCCESS,
  DOWNLOAD_MPCI_TEMPLATE_FAILURE,
  VALIDATE_MPCI_EXCEL_REQUEST,
  VALIDATE_MPCI_EXCEL_SUCCESS,
  VALIDATE_MPCI_EXCEL_FAILURE,
  RESET_MPCI_EXCEL_UPLOAD,
  DOWNLOAD_MPCI_ERROR_REPORT_REQUEST,
  DOWNLOAD_MPCI_ERROR_REPORT_SUCCESS,
  DOWNLOAD_MPCI_ERROR_REPORT_FAILURE,
  PROCEED_MPCI_VALIDATED_HBLS_REQUEST,
  PROCEED_MPCI_VALIDATED_HBLS_SUCCESS,
  PROCEED_MPCI_VALIDATED_HBLS_FAILURE,
  PROCEED_MPCI_ALL_HBLS_REQUEST,
  PROCEED_MPCI_ALL_HBLS_SUCCESS,
  PROCEED_MPCI_ALL_HBLS_FAILURE,
  CLEAR_MPCI_EXCEL_PROCEED_RESPONSE,
  ADD_PDF_EXTRACTION_FILES,
  START_PDF_EXTRACTION,
  EXTRACT_PDF_FILE_REQUEST,
  EXTRACT_PDF_FILE_SUCCESS,
  EXTRACT_PDF_FILE_FAILURE,
  RETRY_PDF_FILE,
  UPDATE_PDF_REVIEW_FIELD,
  TOUCH_PDF_REVIEW_FIELD,
  UPDATE_PDF_REVIEW_MASTER_FIELD,
  SET_PDF_FILE_VALIDATION,
  MARK_PDF_FILE_REVIEWED,
  SET_ACTIVE_PDF_FILE,
  REMOVE_PDF_FILE,
  CLEAR_PDF_EXTRACTION,

  
} from "../actionTypes";

export const saveFilingRequest = (payload) => ({
  type: SAVE_FILING_REQUEST,
  payload,
});

export const submitFilingRequest = (payload) => ({
  type: SUBMIT_FILING_REQUEST,
  payload,
});

export const fetchStatusRequest = (payload) => ({
  type: FETCH_STATUS_REQUEST,
  payload,
});

export const fetchSubmissionHistoryRequest = (payload) => ({
  type: FETCH_SUBMISSION_HISTORY_REQUEST,
  payload,
});

export const fetchAgentMPCIRowsRequest = (payload) => ({
  type: FETCH_AGENT_MPCI_ROWS_REQUEST,
  payload: { payload },
});

export const changeAgentMpciDisplayHeaders = (headerArray) => ({
  type: CHANGE_AGENT_MPCI_DISPLAY_HEADERS,
  payload: headerArray,
});

export const downloadAgentMPCIRowsRequest = (payload) => ({
  type: DOWNLOAD_AGENT_MPCI_ROWS_REQUEST,
  payload: { payload },
});

export const downloadAgentMPCIRowsSuccess = (payload) => ({
  type: DOWNLOAD_AGENT_MPCI_ROWS_SUCCESS,
  payload,
});

export const downloadAgentMPCIRowsFailure = (error) => ({
  type: DOWNLOAD_AGENT_MPCI_ROWS_FAILURE,
  payload: error,
});

// Common request for all dropdowns
export const fetchMpciMasterRequest = (payload) => ({
  type: FETCH_MPCI_MASTER_REQUEST,
  payload,
});

export const fetchMpciMasterSuccess = ({ section, targetField, data }) => ({
  type: FETCH_MPCI_MASTER_SUCCESS,
  payload: {
    section,
    targetField,
    data,
  },
});

export const fetchMpciMasterFailure = (error, section) => ({
  type: FETCH_MPCI_MASTER_FAILURE,
  payload: {
    section,
    message: error?.response?.data?.error?.message || error?.message || "Master fetch failed",
  },
});

// Party Lookup Actions like auto fill party name
export const fetchMpciPartyLookupRequest = (payload) => ({
  type: FETCH_MPCI_PARTY_LOOKUP_REQUEST,
  payload,
});

export const fetchMpciPartyLookupSuccess = (payload) => ({
  type: FETCH_MPCI_PARTY_LOOKUP_SUCCESS,
  payload,
});

export const fetchMpciPartyLookupFailure = (payload) => ({
  type: FETCH_MPCI_PARTY_LOOKUP_FAILURE,
  payload,
});

export const clearMpciPartyLookup = (payload) => ({
  type: CLEAR_MPCI_PARTY_LOOKUP,
  payload,
});

// fetch HBL List for a booking
export const fetchAgentMPCIhblListRequest = (payload) => ({
  type: FETCH_AGENT_MPCI_HBL_LIST_REQUEST,
  payload: { payload },
});

// Fetch MPCI details by master ID
export const fetchMPCIDetailsRequest = (masterId) => ({
  type: FETCH_MPCI_DETAILS_REQUEST,
  payload: { masterId },
});

export const fetchMPCIDetailsSuccess = (data) => ({
  type: FETCH_MPCI_DETAILS_SUCCESS,
  payload: data,
});

export const fetchMPCIDetailsFailure = (error) => ({
  type: FETCH_MPCI_DETAILS_FAILURE,
  payload: error,
});

export const clearMPCIDetails = () => ({
  type: CLEAR_MPCI_DETAILS,
});

// Link hbl

export const fetchMPCILinkHBLDetailsRequest = ({ shipmentIds }) => ({
  type: FETCH_MPCI_LINK_HBL_DETAILS_REQUEST,
  payload: { shipmentIds },
});

export const fetchMPCILinkHBLDetailsSuccess = (shipmentSummaries) => ({
  type: FETCH_MPCI_LINK_HBL_DETAILS_SUCCESS,
  payload: shipmentSummaries,
});

export const fetchMPCILinkHBLDetailsFailure = (error) => ({
  type: FETCH_MPCI_LINK_HBL_DETAILS_FAILURE,
  payload: error,
});

// attachement get

export const uploadMPCIAttachmentRequest = (payload) => ({
  type: UPLOAD_MPCI_ATTACHMENT_REQUEST,
  payload,
});

export const uploadMPCIAttachmentSuccess = (payload) => ({
  type: UPLOAD_MPCI_ATTACHMENT_SUCCESS,
  payload,
});

export const uploadMPCIAttachmentFailure = (error) => ({
  type: UPLOAD_MPCI_ATTACHMENT_FAILURE,
  payload: error,
});

// attachement get

export const fetchMPCIAttachmentsByBlRequest = (payload) => ({
  type: FETCH_MPCI_ATTACHMENTS_BY_BL_REQUEST,
  payload,
});

export const fetchMPCIAttachmentsByBlSuccess = (payload) => ({
  type: FETCH_MPCI_ATTACHMENTS_BY_BL_SUCCESS,
  payload,
});

export const fetchMPCIAttachmentsByBlFailure = (error) => ({
  type: FETCH_MPCI_ATTACHMENTS_BY_BL_FAILURE,
  payload: error,
});

// attachement delete

export const deleteMPCIAttachmentRequest = (payload) => ({
  type: DELETE_MPCI_ATTACHMENT_REQUEST,
  payload,
});

export const deleteMPCIAttachmentSuccess = (payload) => ({
  type: DELETE_MPCI_ATTACHMENT_SUCCESS,
  payload,
});

export const deleteMPCIAttachmentFailure = (error) => ({
  type: DELETE_MPCI_ATTACHMENT_FAILURE,
  payload: error,
});

// attachement put
export const updateMPCIAttachmentRequest = (payload) => ({
  type: UPDATE_MPCI_ATTACHMENT_REQUEST,
  payload,
});

export const updateMPCIAttachmentSuccess = (payload) => ({
  type: UPDATE_MPCI_ATTACHMENT_SUCCESS,
  payload,
});

export const updateMPCIAttachmentFailure = (error) => ({
  type: UPDATE_MPCI_ATTACHMENT_FAILURE,
  payload: error,
});

export const fetchMPCIPreviewRequest = (payload) => ({
  type: FETCH_MPCI_PREVIEW_REQUEST,
  payload,
});

export const fetchMPCIPreviewSuccess = (payload) => ({
  type: FETCH_MPCI_PREVIEW_SUCCESS,
  payload,
});

export const fetchMPCIPreviewFailure = (error) => ({
  type: FETCH_MPCI_PREVIEW_FAILURE,
  payload: error,
});

export const saveMpciContainerHeadersRequest = (payload) => ({
  type: SAVE_MPCI_CONTAINER_HEADERS_REQUEST,
  payload,
});

export const saveMpciContainerHeadersSuccess = (payload) => ({
  type: SAVE_MPCI_CONTAINER_HEADERS_SUCCESS,
  payload,
});

export const saveMpciContainerHeadersFailure = (error) => ({
  type: SAVE_MPCI_CONTAINER_HEADERS_FAILURE,
  payload: error,
});

export const downloadMpciTemplateRequest = (download) => ({
  type: DOWNLOAD_MPCI_TEMPLATE_REQUEST,
  payload: { download },
});

export const downloadMpciTemplateSuccess = () => ({
  type: DOWNLOAD_MPCI_TEMPLATE_SUCCESS,
});

export const downloadMpciTemplateFailure = (error) => ({
  type: DOWNLOAD_MPCI_TEMPLATE_FAILURE,
  payload: error,
});

export const validateMpciExcelRequest = (payload) => ({
  type: VALIDATE_MPCI_EXCEL_REQUEST,
  payload,
});

export const validateMpciExcelSuccess = (payload) => ({
  type: VALIDATE_MPCI_EXCEL_SUCCESS,
  payload,
});

export const validateMpciExcelFailure = (error) => ({
  type: VALIDATE_MPCI_EXCEL_FAILURE,
  payload: error,
});

export const resetMpciExcelUpload = () => ({
  type: RESET_MPCI_EXCEL_UPLOAD,
});

export const downloadMpciErrorReportRequest = (payload) => ({
  type: DOWNLOAD_MPCI_ERROR_REPORT_REQUEST,
  payload,
});

export const downloadMpciErrorReportSuccess = () => ({
  type: DOWNLOAD_MPCI_ERROR_REPORT_SUCCESS,
});

export const downloadMpciErrorReportFailure = (error) => ({
  type: DOWNLOAD_MPCI_ERROR_REPORT_FAILURE,
  payload: error,
});

export const proceedMpciValidatedHblsRequest = (payload) => ({
  type: PROCEED_MPCI_VALIDATED_HBLS_REQUEST,
  payload,
});

export const proceedMpciValidatedHblsSuccess = (payload) => ({
  type: PROCEED_MPCI_VALIDATED_HBLS_SUCCESS,
  payload,
});

export const proceedMpciValidatedHblsFailure = (error) => ({
  type: PROCEED_MPCI_VALIDATED_HBLS_FAILURE,
  payload: error,
});

export const proceedMpciAllHblsRequest = (payload) => ({
  type: PROCEED_MPCI_ALL_HBLS_REQUEST,
  payload,
});

export const proceedMpciAllHblsSuccess = (payload) => ({
  type: PROCEED_MPCI_ALL_HBLS_SUCCESS,
  payload,
});

export const proceedMpciAllHblsFailure = (error) => ({
  type: PROCEED_MPCI_ALL_HBLS_FAILURE,
  payload: error,
});

export const clearMpciExcelProceedResponse = () => ({
  type: CLEAR_MPCI_EXCEL_PROCEED_RESPONSE,
});

/* ---------------- HBL PDF/Image (Gemini) extraction ---------------- */

// payload: { files: [{ id, fileName, fileType }] } — File blobs live in pdfExtractionFileCache
export const addPdfExtractionFiles = (payload) => ({
  type: ADD_PDF_EXTRACTION_FILES,
  payload,
});

export const startPdfExtraction = () => ({
  type: START_PDF_EXTRACTION,
});

export const extractPdfFileRequest = (payload) => ({
  type: EXTRACT_PDF_FILE_REQUEST,
  payload,
});

export const extractPdfFileSuccess = (payload) => ({
  type: EXTRACT_PDF_FILE_SUCCESS,
  payload,
});

export const extractPdfFileFailure = (payload) => ({
  type: EXTRACT_PDF_FILE_FAILURE,
  payload,
});

export const retryPdfFile = (payload) => ({
  type: RETRY_PDF_FILE,
  payload,
});

// payload: { id, path: string[], value }
export const updatePdfReviewField = (payload) => ({
  type: UPDATE_PDF_REVIEW_FIELD,
  payload,
});

// payload: { id, path: string[] }
export const touchPdfReviewField = (payload) => ({
  type: TOUCH_PDF_REVIEW_FIELD,
  payload,
});

// payload: { id, basePath: string[], field: object }
export const updatePdfReviewMasterField = (payload) => ({
  type: UPDATE_PDF_REVIEW_MASTER_FIELD,
  payload,
});

// payload: { id, showErrors, errorsByPath }
export const setPdfFileValidation = (payload) => ({
  type: SET_PDF_FILE_VALIDATION,
  payload,
});

export const markPdfFileReviewed = (payload) => ({
  type: MARK_PDF_FILE_REVIEWED,
  payload,
});

export const setActivePdfFile = (payload) => ({
  type: SET_ACTIVE_PDF_FILE,
  payload,
});

export const removePdfFile = (payload) => ({
  type: REMOVE_PDF_FILE,
  payload,
});

export const clearPdfExtraction = () => ({
  type: CLEAR_PDF_EXTRACTION,
});
