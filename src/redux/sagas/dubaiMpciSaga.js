// Redux/Sagas/filingSaga.js
import { all, call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import {
  SAVE_FILING_REQUEST,
  SAVE_FILING_SUCCESS,
  SAVE_FILING_FAILURE,
  SUBMIT_FILING_REQUEST,
  SUBMIT_FILING_SUCCESS,
  SUBMIT_FILING_FAILURE,
  FETCH_STATUS_REQUEST,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
  FETCH_SUBMISSION_HISTORY_REQUEST,
  FETCH_SUBMISSION_HISTORY_SUCCESS,
  FETCH_SUBMISSION_HISTORY_FAILURE,
  FETCH_AGENT_MPCI_ROWS_REQUEST,
  FETCH_AGENT_MPCI_ROWS_SUCCESS,
  FETCH_AGENT_MPCI_ROWS_FAILURE,
  DOWNLOAD_AGENT_MPCI_ROWS_REQUEST,
  FETCH_MPCI_MASTER_REQUEST,
  FETCH_MPCI_PARTY_LOOKUP_REQUEST,

  FETCH_MPCI_DETAILS_REQUEST,
  FETCH_MPCI_DETAILS_SUCCESS,
  FETCH_MPCI_DETAILS_FAILURE,

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

  START_PDF_EXTRACTION,
  RETRY_PDF_FILE,
} from "../actionTypes";
import {
  fetchMpciMasterSuccess,
  fetchMpciMasterFailure,
  downloadAgentMPCIRowsSuccess,
  downloadAgentMPCIRowsFailure,
  fetchMpciPartyLookupSuccess,
  fetchMpciPartyLookupFailure,
  saveMpciContainerHeadersSuccess,
  saveMpciContainerHeadersFailure,

  extractPdfFileRequest,
  extractPdfFileSuccess,
  extractPdfFileFailure,
} from "../actions/dubaiMpciAction";
import {
  ErrorToastAlert,
  SuccessToastAlert,
} from "@/components/toast/toast";

import {
  saveFilingApi,
  submitFilingApi,
  fetchSubmissionHistoryApi,
  fetchStatusListApi,
  fetchAgentMPCIRowsService,
  downloadAgentMPCIRowsService,
  getMpciMasterList,
  fetchMpciPartyLookupService,

  fetchMPCIDetailsService,

  uploadMPCIAttachmentApi,
  fetchMPCIAttachmentsByBlApi,
  deleteMPCIAttachmentApi,
  updateMPCIAttachmentApi,
  fetchMPCIPreviewApi,
  saveMpciContainerHeadersService,

  extractFromPdfApi,
} from "@/services/dubaiMpciService";
import { mapMasterContainerHeaders } from "@/pages/DubaiMPCI/MapperLayer/mpciMapper";
import { buildReviewModel } from "@/pages/DubaiMPCI/pdfExtraction/reviewModel";
import { getPdfExtractionFile } from "@/pages/DubaiMPCI/pdfExtraction/pdfExtractionFileCache";
import { environment } from "@/environment/environment";

/* ---------- Save Filing ---------- */
function* saveFilingSaga(action) {
  try {
    const response = yield call(saveFilingApi, action.payload);
    const isUpdate = Boolean(
      action.payload?.masterId ?? action.payload?.formData?.masterId,
    );

    yield call(
      SuccessToastAlert,
      isUpdate ? "Filing updated successfully" : "Filing saved successfully",
    );

    yield put({ type: SAVE_FILING_SUCCESS, payload: response });
  } catch (error) {
    yield call(
      ErrorToastAlert,
      error?.response?.data?.message ||
        error?.message ||
        "Failed to save filing",
    );
    yield put({
      type: SAVE_FILING_FAILURE,
      payload:
        error?.response?.data?.message ||
        error?.message ||
        "Save filing failed",
    });
  }
}

/* ---------- Submit Filing ---------- */
function* submitFilingSaga(action) {
  try {
    const response = yield call(submitFilingApi, action.payload);
    yield call(SuccessToastAlert, "Filing submitted successfully");
    yield put({ type: SUBMIT_FILING_SUCCESS, payload: response });
  } catch (error) {
    yield call(ErrorToastAlert, error?.message || "Failed to submit filing");
    yield put({
      type: SUBMIT_FILING_FAILURE,
      payload: error?.message || "Submit filing failed",
    });
  }
}
/* ---------- Submit History ---------- */
function* fetchSubmissionHistorySaga({ payload }) {
  try {
    const res = yield call(fetchSubmissionHistoryApi, payload || {});
    yield put({
      type: FETCH_SUBMISSION_HISTORY_SUCCESS,
      payload: Array.isArray(res?.data) ? res.data : [],
    });
  } catch (error) {
    yield put({
      type: FETCH_SUBMISSION_HISTORY_FAILURE,
      payload:
        error?.response?.data?.error?.message ||
        "Failed to fetch submission history",
    });
  }
}
/* ---------- Status ---------- */
function* fetchStatusSaga({ payload }) {
  try {
    const res = yield call(fetchStatusListApi, payload || {});
    yield put({
      type: FETCH_STATUS_SUCCESS,
      payload: Array.isArray(res?.data) ? res.data : [],
    });
  } catch (error) {
    yield put({
      type: FETCH_STATUS_FAILURE,
      payload: error?.response?.data?.error?.message || "Status fetch failed",
    });
  }
}

// /* -------------- Agent MPIC tables rows  ------*/
function* fetchAgentMPCIRowsSaga({ payload }) {
  try {
    const res = yield call(fetchAgentMPCIRowsService, payload);
    const response = res?.data?.data || res?.data || {};
    yield put({
      type: FETCH_AGENT_MPCI_ROWS_SUCCESS,
      payload: {
        shipment: response?.shipment || [],
        statusWiseCount: response?.statusWiseCount || {},
      },
    });
  } catch (error) {
    yield call(
      ErrorToastAlert,
      error?.message || "Failed to Dashboard",
    );
    yield put({
      type: FETCH_AGENT_MPCI_ROWS_FAILURE,
      payload: error?.response?.data?.error?.message || "Rows fetch failed",
    });
  }
}
// Dubai MPCI Download Excel Dashboard
function* downloadAgentMPCIRowsSaga({ payload }) {
  try {
    const res = yield call(downloadAgentMPCIRowsService, payload);
    const fileName = getDownloadFileName(
      res?.headers || {},
      `uae-mpci-filing-${payload?.payload?.filterDays || "all"}-days.xlsx`,
    );

    downloadBlobFile(res?.data, fileName);
    yield put(downloadAgentMPCIRowsSuccess({ fileName }));
  } catch (error) {
    yield call(
      ErrorToastAlert,
      error?.message || "Failed to download MPCI filing list",
    );
    yield put(
      downloadAgentMPCIRowsFailure(
        error?.response?.data?.error?.message ||
          error?.message ||
          "MPCI filing list download failed",
      ),
    );
  }
}

//

function* fetchMPCIDetailsSaga({ payload }) {
  try {
    const res = yield call(fetchMPCIDetailsService, payload);
    yield put({
      type: FETCH_MPCI_DETAILS_SUCCESS,
      payload: res?.data?.data || null,
    });
  } catch (error) {
    yield put({
      type: FETCH_MPCI_DETAILS_FAILURE,
      payload:
        error?.response?.data?.error?.message || "MPCI details fetch failed",
    });
  }
}

/* -------------- Attachment Update  ------*/

function* uploadMPCIAttachmentSaga({ payload }) {
  try {
    const res = yield call(uploadMPCIAttachmentApi, payload || {});
    yield put({
      type: UPLOAD_MPCI_ATTACHMENT_SUCCESS,
      payload: {
        blId: payload?.blId,
        data: res?.data || null,
      },
    });
    if (payload?.blId) {
      yield put({
        type: FETCH_MPCI_ATTACHMENTS_BY_BL_REQUEST,
        payload: { blId: payload.blId },
      });
    }
  } catch (error) {
    yield put({
      type: UPLOAD_MPCI_ATTACHMENT_FAILURE,
      payload:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Attachment upload failed",
    });
  }
}
/* -------------- Attachment GET  ------*/

function* fetchMPCIAttachmentsByBlSaga({ payload }) {
  try {
    const blId = Number(payload?.blId);
    if (!Number.isFinite(blId) || blId <= 0) {
      yield put({
        type: FETCH_MPCI_ATTACHMENTS_BY_BL_SUCCESS,
        payload: { blId: null, data: [] },
      });
      return;
    }

    const res = yield call(fetchMPCIAttachmentsByBlApi, { blId });
    yield put({
      type: FETCH_MPCI_ATTACHMENTS_BY_BL_SUCCESS,
      payload: {
        blId,
        data: Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [],
      },
    });
  } catch (error) {
    yield put({
      type: FETCH_MPCI_ATTACHMENTS_BY_BL_FAILURE,
      payload:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Attachment list fetch failed",
    });
  }
}
/* -------------- Attachment Delete  ------*/

function* deleteMPCIAttachmentSaga({ payload }) {
  try {
    const attachmentId = Number(payload?.attachmentId);
    const blId = Number(payload?.blId);

    if (!Number.isFinite(attachmentId) || attachmentId <= 0) {
      yield put({
        type: DELETE_MPCI_ATTACHMENT_FAILURE,
        payload: "Invalid attachment id",
      });
      return;
    }

    yield call(deleteMPCIAttachmentApi, { attachmentId });

    yield put({
      type: DELETE_MPCI_ATTACHMENT_SUCCESS,
      payload: {
        attachmentId,
        blId: Number.isFinite(blId) && blId > 0 ? blId : null,
      },
    });

    if (Number.isFinite(blId) && blId > 0) {
      yield put({
        type: FETCH_MPCI_ATTACHMENTS_BY_BL_REQUEST,
        payload: { blId },
      });
    }
  } catch (error) {
    yield put({
      type: DELETE_MPCI_ATTACHMENT_FAILURE,
      payload:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Attachment delete failed",
    });
  }
}

/* -------------- Attachment PUT  ------*/

function* updateMPCIAttachmentSaga({ payload }) {
  try {
    const attachmentId = Number(payload?.attachmentId);
    const blId = Number(payload?.blId);

    if (!Number.isFinite(attachmentId) || attachmentId <= 0) {
      yield put({
        type: UPDATE_MPCI_ATTACHMENT_FAILURE,
        payload: "Invalid attachment id",
      });
      return;
    }

    const res = yield call(updateMPCIAttachmentApi, payload || {});

    yield put({
      type: UPDATE_MPCI_ATTACHMENT_SUCCESS,
      payload: {
        attachmentId,
        blId: Number.isFinite(blId) && blId > 0 ? blId : null,
        data: res?.data || null,
      },
    });

    if (Number.isFinite(blId) && blId > 0) {
      yield put({
        type: FETCH_MPCI_ATTACHMENTS_BY_BL_REQUEST,
        payload: { blId },
      });
    }
  } catch (error) {
    yield put({
      type: UPDATE_MPCI_ATTACHMENT_FAILURE,
      payload:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Attachment update failed",
    });
  }
}

const getDownloadFileName = (headers = {}, fallbackFileName = "") => {
  const disposition =
    headers?.["content-disposition"] || headers?.["Content-Disposition"] || "";
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return fallbackFileName || `CUSCAR_MPCI_${Date.now()}.txt`;
};

function downloadBlobFile(blob, fileName) {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

function* fetchMPCIPreviewSaga({ payload }) {
  try {
    const normalizedMasterId = Number(payload?.masterId);
    const normalizedBlIds = Array.isArray(payload?.blIds)
      ? payload.blIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && id > 0)
      : [];

    if (!Number.isFinite(normalizedMasterId) || normalizedMasterId <= 0) {
      throw new Error("Invalid masterId for preview");
    }

    if (!normalizedBlIds.length) {
      throw new Error("Select at least one House BL to preview");
    }

    const res = yield call(fetchMPCIPreviewApi, {
      masterId: normalizedMasterId,
      blIds: normalizedBlIds.join(","),
    });

    const fileName = getDownloadFileName(res?.headers || {});
    downloadBlobFile(res?.data, fileName);

    yield put({
      type: FETCH_MPCI_PREVIEW_SUCCESS,
      payload: {
        fileName,
      },
    });
  } catch (error) {
    yield put({
      type: FETCH_MPCI_PREVIEW_FAILURE,
      payload:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Preview download failed",
    });
  }
}

// HBL Link shipment details

// 
function* fetchMPCILinkHBLSaga({ payload }) {
  try {
    const shipmentIds = payload?.shipmentIds || [];

    if (!shipmentIds.length) {
      yield put({
        type: FETCH_MPCI_LINK_HBL_DETAILS_SUCCESS,
        payload: [],
      });
      return;
    }

    const res = yield call(fetchMPCIhbllLink, {
      shipmentIds: shipmentIds.join(","),
    });

    yield put({
      type: FETCH_MPCI_LINK_HBL_DETAILS_SUCCESS,
      payload: Array.isArray(res?.data) ? res.data : [],
    });
  } catch (error) {
    yield put({
      type: FETCH_MPCI_LINK_HBL_DETAILS_FAILURE,
      payload:
        error?.response?.data?.error?.message ||
        "Linked HBL booking details fetch failed",
    });
  }
}

// Common request for all dropdowns
function* fetchMpciMasterSaga(action) {
  try {
    const {
      type,
      searchText,
      section,
      targetField,
      countryId,
      stateId,
      role,
      filter,
      transportMode,
    } = action.payload;

    const response = yield call(getMpciMasterList, {
      type,
      searchText,
      countryId,
      stateId,
      role,
      filter,
      transportMode,
    });

    yield put(
      fetchMpciMasterSuccess({
        section,
        targetField,
        data: response.data,
      }),
    );
  } catch (error) {
    yield put(fetchMpciMasterFailure(error, action.payload?.section));
  }
}

// Party Lookup Actions like auto fill party name
function* fetchMpciPartyLookupSaga({ payload }) {
  try {
    const fieldName = payload?.fieldName;
    const partyName = String(payload?.partyName || "").trim();

    if (!fieldName) return;

    if (partyName.length < 2) {
      yield put(
        fetchMpciPartyLookupSuccess({
          fieldName,
          partyName,
          data: [],
        }),
      );
      return;
    }

    const response = yield call(fetchMpciPartyLookupService, { partyName });

    yield put(
      fetchMpciPartyLookupSuccess({
        fieldName,
        partyName,
        data: Array.isArray(response?.data?.data) ? response.data.data : [],
      }),
    );
  } catch (error) {
    yield put(
      fetchMpciPartyLookupFailure({
        fieldName: payload?.fieldName,
        partyName: payload?.partyName || "",
        message:
          error?.response?.data?.error?.message ||
          error?.message ||
          "Party lookup fetch failed",
      }),
    );
  }
}
// Container Headers Save
function* saveMpciContainerHeadersSaga({ payload }) {
  try {
    const response = yield call(saveMpciContainerHeadersService, payload || {});
    yield put(saveMpciContainerHeadersSuccess(response));
  } catch (error) {
    yield put(
      saveMpciContainerHeadersFailure(
        error?.message || "Container headers sync failed",
      ),
    );
  }
}

// EXCEL UPLOAD - Download Template Button





function* extractSinglePdfFile(fileId) {
  const fileEntry = yield select((state) =>
    (state.DubaiFormFiling?.pdfExtraction?.files || []).find(
      (item) => item.id === fileId,
    ),
  );

  const fileObj = getPdfExtractionFile(fileId);
  if (!fileEntry || !fileObj) return;

  yield put(extractPdfFileRequest({ id: fileId }));

  try {
    const data = yield call(extractFromPdfApi, { file: fileObj });
    const failed = data?.status === "failed" || !data?.reviewData;

    if (failed) {
      const errors =
        Array.isArray(data?.errors) && data.errors.length
          ? data.errors
          : ["Extraction failed. You can retry or fill the form manually."];
      yield put(extractPdfFileFailure({ id: fileId, errors }));
      return;
    }

    yield put(
      extractPdfFileSuccess({
        id: fileId,
        reviewData: data.reviewData,
        editedData: buildReviewModel(data.reviewData),
      }),
    );
  } catch (error) {
    yield put(
      extractPdfFileFailure({
        id: fileId,
        errors: [
          error?.response?.data?.error?.message ||
            error?.message ||
            "Extraction failed. You can retry or fill the form manually.",
        ],
      }),
    );
  }
}

// Orchestrates all queued files: sequential (one at a time) or parallel
// (bounded by maxConcurrency) per frontend config. No auto-retry/backoff.
function* startPdfExtractionSaga() {
  try {
    const pdfState = yield select(
      (state) => state.DubaiFormFiling?.pdfExtraction || {},
    );
    const queuedIds = (pdfState.files || [])
      .filter((file) => file.status === "queued")
      .map((file) => file.id);

    if (!queuedIds.length) return;

    if (pdfState.processingMode === "parallel") {
      const maxConcurrency = Math.max(
        1,
        Number(environment?.pdfExtraction?.maxConcurrency) || 3,
      );
      for (let i = 0; i < queuedIds.length; i += maxConcurrency) {
        const chunk = queuedIds.slice(i, i + maxConcurrency);
        yield all(chunk.map((id) => call(extractSinglePdfFile, id)));
      }
    } else {
      for (const id of queuedIds) {
        yield call(extractSinglePdfFile, id);
      }
    }
  } catch (error) {
    yield call(ErrorToastAlert, error?.message || "PDF extraction failed");
  }
}

// Manual, on-demand re-extraction of a single file (Retry button).
function* retryPdfFileSaga({ payload }) {
  if (payload?.id) {
    yield call(extractSinglePdfFile, payload.id);
  }
}

export default function* DubaiMPCISaga() {
  yield takeLatest(SAVE_FILING_REQUEST, saveFilingSaga);
  yield takeLatest(SUBMIT_FILING_REQUEST, submitFilingSaga);
  yield takeLatest(
    FETCH_SUBMISSION_HISTORY_REQUEST,
    fetchSubmissionHistorySaga,
  );
  yield takeLatest(FETCH_STATUS_REQUEST, fetchStatusSaga);
  yield takeLatest(FETCH_AGENT_MPCI_ROWS_REQUEST, fetchAgentMPCIRowsSaga);
  yield takeLatest(DOWNLOAD_AGENT_MPCI_ROWS_REQUEST, downloadAgentMPCIRowsSaga);
  
  
  yield takeLatest(FETCH_MPCI_DETAILS_REQUEST, fetchMPCIDetailsSaga);
  yield takeEvery(FETCH_MPCI_MASTER_REQUEST, fetchMpciMasterSaga);
  yield takeEvery(FETCH_MPCI_PARTY_LOOKUP_REQUEST, fetchMpciPartyLookupSaga);
  yield takeLatest(UPLOAD_MPCI_ATTACHMENT_REQUEST, uploadMPCIAttachmentSaga);
  yield takeLatest(
    FETCH_MPCI_ATTACHMENTS_BY_BL_REQUEST,
    fetchMPCIAttachmentsByBlSaga,
  );
  yield takeLatest(DELETE_MPCI_ATTACHMENT_REQUEST, deleteMPCIAttachmentSaga);
  yield takeLatest(UPDATE_MPCI_ATTACHMENT_REQUEST, updateMPCIAttachmentSaga);
  yield takeLatest(FETCH_MPCI_PREVIEW_REQUEST, fetchMPCIPreviewSaga);
  yield takeLatest(
    SAVE_MPCI_CONTAINER_HEADERS_REQUEST,
    saveMpciContainerHeadersSaga,
  );
  
  
  
  
  
  yield takeLatest(START_PDF_EXTRACTION, startPdfExtractionSaga);
  yield takeEvery(RETRY_PDF_FILE, retryPdfFileSaga);
}
