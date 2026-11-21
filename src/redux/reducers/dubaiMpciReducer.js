// Redux/Reducers/mainReducer.js
import {
  FETCH_SUBMISSION_HISTORY_REQUEST,
  FETCH_SUBMISSION_HISTORY_SUCCESS,
  FETCH_SUBMISSION_HISTORY_FAILURE,
  FETCH_STATUS_REQUEST,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
  SAVE_FILING_REQUEST,
  SAVE_FILING_SUCCESS,
  SAVE_FILING_FAILURE,
  SUBMIT_FILING_REQUEST,
  SUBMIT_FILING_SUCCESS,
  SUBMIT_FILING_FAILURE,
  FETCH_AGENT_MPCI_ROWS_REQUEST,
  FETCH_AGENT_MPCI_ROWS_SUCCESS,
  FETCH_AGENT_MPCI_ROWS_FAILURE,
  CHANGE_AGENT_MPCI_DISPLAY_HEADERS,
  DOWNLOAD_AGENT_MPCI_ROWS_REQUEST,
  DOWNLOAD_AGENT_MPCI_ROWS_SUCCESS,
  DOWNLOAD_AGENT_MPCI_ROWS_FAILURE,
  FETCH_AGENT_MPCI_HBL_LIST_REQUEST,
  FETCH_AGENT_MPCI_HBL_LIST_SUCCESS,
  FETCH_AGENT_MPCI_HBL_LIST_FAILURE,
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
  FETCH_MPCI_PARTY_LOOKUP_REQUEST,
  FETCH_MPCI_PARTY_LOOKUP_SUCCESS,
  FETCH_MPCI_PARTY_LOOKUP_FAILURE,
  CLEAR_MPCI_PARTY_LOOKUP,
  ADD_PDF_EXTRACTION_FILES,
  START_PDF_EXTRACTION,
  EXTRACT_PDF_FILE_REQUEST,
  EXTRACT_PDF_FILE_SUCCESS,
  EXTRACT_PDF_FILE_FAILURE,
  UPDATE_PDF_REVIEW_FIELD,
  TOUCH_PDF_REVIEW_FIELD,
  UPDATE_PDF_REVIEW_MASTER_FIELD,
  SET_PDF_FILE_VALIDATION,
  MARK_PDF_FILE_REVIEWED,
  SET_ACTIVE_PDF_FILE,
  REMOVE_PDF_FILE,
  CLEAR_PDF_EXTRACTION,
} from "../actionTypes";
import { setByPath } from "@/pages/DubaiMPCI/pdfExtraction/reviewModel";
import { environment } from "@/environment/environment";
import {
  buildShipmentPartySummaryIndex,
  EMPTY_SHIPMENT_PARTY_SUMMARY_INDEX,
} from "@/pages/DubaiMPCI/MapperLayer/partyAutofill";
import { initialContainerHeaderValue } from "@/pages/DubaiMPCI/InitialValues/initialContainerHeaderValue";
import {
  buildMpciShipmentsIndex,
  buildValidShipmentsIndex,
} from "@/services/dubaiMpciService";

const initialState = {
  submissionHistory: {
    submissionHistoryList: [],
    loading: false,
    error: null,
  },
  status: {
    statusList: [],
    loading: false,
    error: null,
  },
  filing: {
    saving: false,
    submitting: false,
    error: null,
    lastSavedId: null,
  },
  AgentMPCIRows: {
    agentRowListData: [],
    statusWiseCount: {},
    loading: true,
    exportLoading: false,
    error: null,
  },
  selectedMPCIDetails: {
    data: null,
    loading: false,
    error: null,
  },
  AgentMPCIhblList: {
    hblList: [],
    hblListCount: 0,
    loading: false,
    loadingMore: false,
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      hasMore: false,
    },
    error: null,
  },
  linkedHBLDetails: {
    shipmentSummaries: [],
    shipmentPartiesSummaries: EMPTY_SHIPMENT_PARTY_SUMMARY_INDEX,
    loading: false,
    error: null,
  },
  attachments: {
    byBlId: {},
    uploading: false,
    fetching: false,
    deleting: false,
    updating: false,
    error: null,
  },
  preview: {
    downloading: false,
    error: null,
    fileName: null,
  },
  excelUpload: {
    downloadingTemplate: false,
    downloadingTemplateType: null,
    validating: false,
    downloadingErrorReport: false,
    proceeding: false,
    validationSummary: null,
    masterContainerDetails: [],
    validShipments: [],
    validShipmentsByUniqueId: {},
    invalidShipments: [],
    allShipments: [],
    allShipmentsByUniqueId: {},
    proceedResponse: null,
    error: null,
  },
  // HBL PDF/Image (Gemini) extraction — per-file review state (in-memory only,
  // discarded when the modal closes). Not shared with the Excel flow.
  pdfExtraction: {
    files: [], // one entry per uploaded PDF/image (see ADD_PDF_EXTRACTION_FILES for shape)
    activeFileId: null, // id of the file currently selected in the review UI
    processingMode:
      environment?.pdfExtraction?.processingMode === "parallel"
        ? "parallel"
        : "sequential", // sequential (default) or parallel extraction
    extracting: false, // true while any file is still queued or extracting
  },
  containerHeaderTemplates: {
    data: [initialContainerHeaderValue()],
    options: [],
    indexByContainerNo: {},
    loading: false,
    error: null,
  },
  jobDetails: {
    carrierList: [],
    firstPortOfLoadingList: [],
    lastForeignPortList: [],
    portOfDischargeList: [],
    vesselList: [],
    vesselCountryList: [],
    loading: false,
    error: null,
  },

  generalInfoDetails: {
    portOfAcceptanceList: [],
    portOfTranshipmentList: [],
    endDestinationList: [],
    placeOfBillIssueList: [],
    placeOfFreightPaymentList: [],
    currencyList: [],
    efsAgentList: [],
    loading: false,
    error: null,
  },

  partiesDetails: {
    countryList: [],
    stateList: [],
    cityList: [],
    loading: false,
    error: null,
  },
  partyLookup: {
    byField: {},
  },
  containerDetails: {
    packageTypeList: [],
    containerCodeList: [],
    handlingInstructionList: [],
    loading: false,
    error: null,
  },

  itemDetails: {
    hsCodeList: [],
    containerList: [],
    packageTypeList: [],
    markingInstructionList: [],
    packingDescCodeList: [],
    itemCountryList: [],
    loading: false,
    error: null,
  },

  loading: false,

  displayHeaders: [
    { key: "shipmentId", label: "Shipment ID", status: false },
    { key: "obl", label: "OBL", status: true },
    { key: "hblNo", label: "HBL", status: true },
    { key: "etd", label: "ETD", status: true, date: true },
    { key: "submissionDate", label: "Submission Date", status: true, date: true },
    { key: "origin", label: "Origin", status: true },
    { key: "destination", label: "Destination", status: true },
    { key: "filingRisk", label: "Filing Risk", status: true },
    // { key: "customerName", label: "Customer Name", status: true },
    // { key: "paymentType", label: "Payment Type", status: true },
    // { key: "service", label: "Service", status: true },

    // { key: "eta", label: "ETA", status: true, date: true },
    { key: "status", label: "Status", status: true },
    { key: "action", label: "Action", status: true },
  ],
};

const getMasterIdFromPayload = (payload) =>
  (Array.isArray(payload) ? (payload[0]?.masterId ?? payload[0]?.id) : null) ??
  payload?.masterId ??
  payload?.id ??
  payload?.data?.masterId ??
  payload?.data?.id ??
  payload?.result?.masterId ??
  payload?.result?.id ??
  null;

// export const keyMap = {
//   CARRIER: "carrierList",
//   VESSEL: "vesselList",
//   COUNTRY: "countryList",
//   STATE: "stateList",
//   CITY: "cityList",
//   CONTAINER: "containerList",
//   HS_CODE: "hsCodeList",
//   CURRENCY: "currencyList",
//   MAKING_INSTRUCTION: "markingInstructionList",
//   PACKING_DESC_CODE: "packingDescCodeList",
//   PACKAGE_TYPE: "packageTypeList",
//   PORTNAME: "portList",
// };

const DubaiMPCIReducer = (state = initialState, action) => {
  switch (action.type) {
    /* ---------------- Submission History ---------------- */
    case FETCH_SUBMISSION_HISTORY_REQUEST:
      return {
        ...state,
        submissionHistory: {
          ...state.submissionHistory,
          submissionHistoryList: [],
          loading: true,
          error: null,
        },
      };

    case FETCH_SUBMISSION_HISTORY_SUCCESS:
      return {
        ...state,
        submissionHistory: {
          loading: false,
          submissionHistoryList: Array.isArray(action.payload)
            ? action.payload
            : [],
          error: null,
        },
      };

    case FETCH_SUBMISSION_HISTORY_FAILURE:
      return {
        ...state,
        submissionHistory: {
          ...state.submissionHistory,
          loading: false,
          error: action.payload,
        },
      };

    /* ---------------- Status ---------------- */
    case FETCH_STATUS_REQUEST:
      return {
        ...state,
        status: {
          ...state.status,
          statusList: [],
          loading: true,
          error: null,
        },
      };

    case FETCH_STATUS_SUCCESS:
      return {
        ...state,
        status: {
          loading: false,
          statusList: Array.isArray(action.payload) ? action.payload : [],
          error: null,
        },
      };

    case FETCH_STATUS_FAILURE:
      return {
        ...state,
        status: {
          ...state.status,
          loading: false,
          error: action.payload,
        },
      };

    /* ---------------- Filing ---------------- */
    case SAVE_FILING_REQUEST:
      return {
        ...state,
        filing: {
          ...state.filing,
          saving: true,
          error: null,
        },
      };

    case SAVE_FILING_SUCCESS: {
      const savedMasterId = getMasterIdFromPayload(action.payload);
      return {
        ...state,
        filing: {
          ...state.filing,
          saving: false,
          lastSavedId: savedMasterId || state.filing.lastSavedId,
        },
        linkedHBLDetails: {
          ...initialState.linkedHBLDetails,
        },
      };
    }

    case SAVE_FILING_FAILURE:
      return {
        ...state,
        filing: {
          ...state.filing,
          saving: false,
          error: action.payload,
        },
      };

    case SUBMIT_FILING_REQUEST:
      return {
        ...state,
        filing: {
          ...state.filing,
          submitting: true,
          error: null,
        },
      };

    case SUBMIT_FILING_SUCCESS:
      return {
        ...state,
        filing: {
          ...state.filing,
          submitting: false,
        },
      };

    case SUBMIT_FILING_FAILURE:
      return {
        ...state,
        filing: {
          ...state.filing,
          submitting: false,
          error: action.payload,
        },
      };
    // Dubai MPCI row table data

    case FETCH_AGENT_MPCI_ROWS_REQUEST:
      return {
        ...state,
        AgentMPCIRows: {
          ...state.AgentMPCIRows,
          loading: true,
          error: null,
        },
      };

    case FETCH_AGENT_MPCI_ROWS_SUCCESS:
      return {
        ...state,
        AgentMPCIRows: {
          loading: false,
          agentRowListData: action.payload.shipment,
          statusWiseCount: action.payload.statusWiseCount,
          exportLoading: state.AgentMPCIRows.exportLoading,
          error: null,
        },
      };

    case FETCH_AGENT_MPCI_ROWS_FAILURE:
      return {
        ...state,
        AgentMPCIRows: {
          ...state.AgentMPCIRows,
          loading: false,
          error: action.payload,
        },
      };

    // Dubai MPCI Download Excel Dashboard
    case DOWNLOAD_AGENT_MPCI_ROWS_REQUEST:
      return {
        ...state,
        AgentMPCIRows: {
          ...state.AgentMPCIRows,
          exportLoading: true,
          error: null,
        },
      };

    case DOWNLOAD_AGENT_MPCI_ROWS_SUCCESS:
      return {
        ...state,
        AgentMPCIRows: {
          ...state.AgentMPCIRows,
          exportLoading: false,
          error: null,
        },
      };

    case DOWNLOAD_AGENT_MPCI_ROWS_FAILURE:
      return {
        ...state,
        AgentMPCIRows: {
          ...state.AgentMPCIRows,
          exportLoading: false,
          error: action.payload,
        },
      };

    /* ----------------Dubai MPCI Fetch HBL ---------------- */
    case FETCH_MPCI_DETAILS_REQUEST:
      return {
        ...state,
        selectedMPCIDetails: {
          ...state.selectedMPCIDetails,
          data: null,
          loading: true,
          error: null,
        },
      };

    case FETCH_MPCI_DETAILS_SUCCESS: {
      const fetchedMasterId = getMasterIdFromPayload(action.payload);
      return {
        ...state,
        selectedMPCIDetails: {
          loading: false,
          data: action.payload,
          error: null,
        },
        linkedHBLDetails: {
          ...initialState.linkedHBLDetails,
        },
        filing: {
          ...state.filing,
          lastSavedId: fetchedMasterId || state.filing.lastSavedId,
        },
      };
    }

    case FETCH_MPCI_DETAILS_FAILURE:
      return {
        ...state,
        selectedMPCIDetails: {
          ...state.selectedMPCIDetails,
          loading: false,
          error: action.payload,
        },
      };

    case CLEAR_MPCI_DETAILS:
      return {
        ...state,
        selectedMPCIDetails: {
          ...initialState.selectedMPCIDetails,
        },
        submissionHistory: {
          ...initialState.submissionHistory,
        },
        status: {
          ...initialState.status,
        },
        filing: {
          ...initialState.filing,
        },
        linkedHBLDetails: {
          ...initialState.linkedHBLDetails,
        },
        attachments: {
          ...initialState.attachments,
        },
        preview: {
          ...initialState.preview,
        },
        excelUpload: {
          ...initialState.excelUpload,
        },
        pdfExtraction: {
          ...initialState.pdfExtraction,
        },
        containerHeaderTemplates: {
          ...initialState.containerHeaderTemplates,
        },
        partyLookup: {
          ...initialState.partyLookup,
        },
      };

    /* ----------------HBL List for a booking---------------- */

    case FETCH_AGENT_MPCI_HBL_LIST_REQUEST:
      if (action.payload?.payload?.append) {
        return {
          ...state,
          AgentMPCIhblList: {
            ...state.AgentMPCIhblList,
            loadingMore: true,
            error: null,
          },
        };
      }

      // Keep previous rows while searching so UI / selections do not flash empty.
      return {
        ...state,
        AgentMPCIhblList: {
          ...state.AgentMPCIhblList,
          loading: true,
          loadingMore: false,
          error: null,
        },
      };

    case FETCH_AGENT_MPCI_HBL_LIST_SUCCESS:
      return {
        ...state,
        AgentMPCIhblList: {
          loading: false,
          loadingMore: false,
          hblList: action.payload.append
            ? [...state.AgentMPCIhblList.hblList, ...action.payload.shipment]
            : action.payload.shipment,
          hblListCount: action.payload.totalRecords,
          pagination:
            action.payload.pagination ||
            initialState.AgentMPCIhblList.pagination,
          error: null,
        },
      };

    case FETCH_AGENT_MPCI_HBL_LIST_FAILURE:
      return {
        ...state,
        AgentMPCIhblList: {
          ...state.AgentMPCIhblList,
          loading: false,
          loadingMore: false,
          error: action.payload,
        },
      };

    case FETCH_MPCI_LINK_HBL_DETAILS_REQUEST:
      return {
        ...state,
        linkedHBLDetails: {
          ...state.linkedHBLDetails,
          loading: true,
          error: null,
        },
      };

    case FETCH_MPCI_LINK_HBL_DETAILS_SUCCESS:
      return {
        ...state,
        linkedHBLDetails: {
          shipmentSummaries: action.payload || [],
          shipmentPartiesSummaries: buildShipmentPartySummaryIndex(
            action.payload,
          ),
          loading: false,
          error: null,
        },
      };

    case FETCH_MPCI_LINK_HBL_DETAILS_FAILURE:
      return {
        ...state,
        linkedHBLDetails: {
          ...state.linkedHBLDetails,
          loading: false,
          error: action.payload,
        },
      };

    case UPLOAD_MPCI_ATTACHMENT_REQUEST:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploading: true,
          error: null,
        },
      };

    case UPLOAD_MPCI_ATTACHMENT_SUCCESS: {
      const blId = Number(action.payload?.blId);
      const currentList =
        Number.isFinite(blId) && blId > 0
          ? state.attachments.byBlId[blId] || []
          : [];
      const uploadedItem = action.payload?.data;

      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploading: false,
          byBlId:
            Number.isFinite(blId) && blId > 0
              ? {
                  ...state.attachments.byBlId,
                  [blId]:
                    uploadedItem !== null && uploadedItem !== undefined
                      ? [...currentList, uploadedItem]
                      : currentList,
                }
              : state.attachments.byBlId,
        },
      };
    }

    case UPLOAD_MPCI_ATTACHMENT_FAILURE:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploading: false,
          error: action.payload,
        },
      };

    case FETCH_MPCI_ATTACHMENTS_BY_BL_REQUEST:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          fetching: true,
          error: null,
        },
      };

    case FETCH_MPCI_ATTACHMENTS_BY_BL_SUCCESS: {
      const blId = Number(action.payload?.blId);
      const attachmentList = Array.isArray(action.payload?.data)
        ? action.payload.data
        : [];

      return {
        ...state,
        attachments: {
          ...state.attachments,
          fetching: false,
          byBlId:
            Number.isFinite(blId) && blId > 0
              ? {
                  ...state.attachments.byBlId,
                  [blId]: attachmentList,
                }
              : state.attachments.byBlId,
        },
      };
    }

    case FETCH_MPCI_ATTACHMENTS_BY_BL_FAILURE:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          fetching: false,
          error: action.payload,
        },
      };

    case DELETE_MPCI_ATTACHMENT_REQUEST:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          deleting: true,
          error: null,
        },
      };

    case DELETE_MPCI_ATTACHMENT_SUCCESS: {
      const blId = Number(action.payload?.blId);
      const attachmentId = Number(action.payload?.attachmentId);
      const currentList =
        Number.isFinite(blId) && blId > 0
          ? state.attachments.byBlId[blId] || []
          : [];
      const filteredList =
        Number.isFinite(attachmentId) && attachmentId > 0
          ? currentList.filter((item) => Number(item?.id) !== attachmentId)
          : currentList;

      return {
        ...state,
        attachments: {
          ...state.attachments,
          deleting: false,
          byBlId:
            Number.isFinite(blId) && blId > 0
              ? {
                  ...state.attachments.byBlId,
                  [blId]: filteredList,
                }
              : state.attachments.byBlId,
        },
      };
    }

    case DELETE_MPCI_ATTACHMENT_FAILURE:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          deleting: false,
          error: action.payload,
        },
      };

    case UPDATE_MPCI_ATTACHMENT_REQUEST:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          updating: true,
          error: null,
        },
      };

    case UPDATE_MPCI_ATTACHMENT_SUCCESS:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          updating: false,
        },
      };

    case UPDATE_MPCI_ATTACHMENT_FAILURE:
      return {
        ...state,
        attachments: {
          ...state.attachments,
          updating: false,
          error: action.payload,
        },
      };

    case FETCH_MPCI_PREVIEW_REQUEST:
      return {
        ...state,
        preview: {
          downloading: true,
          error: null,
          fileName: null,
        },
      };

    case FETCH_MPCI_PREVIEW_SUCCESS:
      return {
        ...state,
        preview: {
          downloading: false,
          error: null,
          fileName: action.payload?.fileName || null,
        },
      };

    case FETCH_MPCI_PREVIEW_FAILURE:
      return {
        ...state,
        preview: {
          downloading: false,
          error: action.payload,
          fileName: null,
        },
      };

    case SAVE_MPCI_CONTAINER_HEADERS_REQUEST:
      return {
        ...state,
        containerHeaderTemplates: {
          ...state.containerHeaderTemplates,
          loading: true,
          error: null,
        },
      };

    case SAVE_MPCI_CONTAINER_HEADERS_SUCCESS:
      return {
        ...state,
        containerHeaderTemplates: {
          data: Array.isArray(action.payload?.data) ? action.payload.data : [],
          options: Array.isArray(action.payload?.options)
            ? action.payload.options
            : [],
          indexByContainerNo: action.payload?.indexByContainerNo || {},
          loading: false,
          error: null,
        },
      };

    case SAVE_MPCI_CONTAINER_HEADERS_FAILURE:
      return {
        ...state,
        containerHeaderTemplates: {
          ...state.containerHeaderTemplates,
          loading: false,
          error: action.payload,
        },
      };

    case DOWNLOAD_MPCI_TEMPLATE_REQUEST:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          downloadingTemplate: true,
          downloadingTemplateType: action.payload?.download || null,
          error: null,
        },
      };

    case DOWNLOAD_MPCI_TEMPLATE_SUCCESS:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          downloadingTemplate: false,
          downloadingTemplateType: null,
          error: null,
        },
      };

    case DOWNLOAD_MPCI_TEMPLATE_FAILURE:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          downloadingTemplate: false,
          downloadingTemplateType: null,
          error: action.payload,
        },
      };

    case VALIDATE_MPCI_EXCEL_REQUEST:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          validating: true,
          validationSummary: null,
          masterContainerDetails: [],
          validShipments: [],
          validShipmentsByUniqueId: {},
          invalidShipments: [],
          allShipments: [],
          allShipmentsByUniqueId: {},
          proceedResponse: null,
          error: null,
        },
      };

    case VALIDATE_MPCI_EXCEL_SUCCESS: {
      const validShipments = Array.isArray(action.payload?.validShipments)
        ? action.payload.validShipments
        : [];
      const invalidShipments = Array.isArray(action.payload?.invalidShipments)
        ? action.payload.invalidShipments
        : [];
      const allShipments = Array.isArray(action.payload?.allShipments)
        ? action.payload.allShipments
        : [...validShipments, ...invalidShipments];
      const masterContainerDetails = Array.isArray(
        action.payload?.masterContainerDetails,
      )
        ? action.payload.masterContainerDetails
        : [];
      const {
        masterContainerDetails: _omitMasterContainerDetails,
        validShipments: _omitValidShipments,
        invalidShipments: _omitInvalidShipments,
        allShipments: _omitAllShipments,
        ...validationSummary
      } = action.payload || {};

      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          validating: false,
          validationSummary: action.payload ? validationSummary : null,
          masterContainerDetails,
          validShipments,
          validShipmentsByUniqueId: buildValidShipmentsIndex(validShipments),
          invalidShipments,
          allShipments,
          allShipmentsByUniqueId: buildMpciShipmentsIndex(allShipments),
          error: null,
        },
      };
    }

    case VALIDATE_MPCI_EXCEL_FAILURE:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          validating: false,
          validationSummary: null,
          masterContainerDetails: [],
          validShipments: [],
          validShipmentsByUniqueId: {},
          invalidShipments: [],
          allShipments: [],
          allShipmentsByUniqueId: {},
          error: action.payload,
        },
      };

    case RESET_MPCI_EXCEL_UPLOAD:
      return {
        ...state,
        excelUpload: {
          ...initialState.excelUpload,
        },
      };

    case DOWNLOAD_MPCI_ERROR_REPORT_REQUEST:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          downloadingErrorReport: true,
          error: null,
        },
      };

    case DOWNLOAD_MPCI_ERROR_REPORT_SUCCESS:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          downloadingErrorReport: false,
          error: null,
        },
      };

    case DOWNLOAD_MPCI_ERROR_REPORT_FAILURE:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          downloadingErrorReport: false,
          error: action.payload,
        },
      };

    case PROCEED_MPCI_VALIDATED_HBLS_REQUEST:
    case PROCEED_MPCI_ALL_HBLS_REQUEST:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          proceeding: true,
          proceedResponse: null,
          error: null,
        },
      };

    case PROCEED_MPCI_VALIDATED_HBLS_SUCCESS:
    case PROCEED_MPCI_ALL_HBLS_SUCCESS:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          proceeding: false,
          proceedResponse: action.payload || null,
          error: null,
        },
      };

    case PROCEED_MPCI_VALIDATED_HBLS_FAILURE:
    case PROCEED_MPCI_ALL_HBLS_FAILURE:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          proceeding: false,
          error: action.payload,
        },
      };

    case CLEAR_MPCI_EXCEL_PROCEED_RESPONSE:
      return {
        ...state,
        excelUpload: {
          ...state.excelUpload,
          proceedResponse: null,
        },
      };

    /* ---------------- HBL PDF/Image (Gemini) extraction ---------------- */

    case ADD_PDF_EXTRACTION_FILES: {
      const incoming = Array.isArray(action.payload?.files)
        ? action.payload.files
        : [];
      if (!incoming.length) return state;

      const newFiles = incoming.map((file) => ({
        id: file.id, // unique client-side id used to target this file in reducer cases
        fileName: file.fileName, // original file name shown in the UI list
        fileType: file.fileType, // MIME/type (pdf vs image)
        status: "queued", // lifecycle: queued -> extracting -> success | failed
        reviewData: null, // baseline data returned by Gemini (read-only reference)
        editedData: null, // user-editable working copy shown in the review form
        errors: [], // file-level extraction error messages
        reviewed: false, // whether the user has marked this file as reviewed
        showErrors: false, // UI flag for whether validation errors are displayed
        errorsByPath: {}, // validation errors keyed by field path for inline display
        touchedByPath: {}, // field paths the user has edited or blurred (live error gate)
      }));

      const files = [...state.pdfExtraction.files, ...newFiles];

      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files,
          activeFileId: state.pdfExtraction.activeFileId || newFiles[0]?.id,
        },
      };
    }

    case START_PDF_EXTRACTION:
      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          extracting: true,
        },
      };

    case EXTRACT_PDF_FILE_REQUEST: {
      const { id } = action.payload || {};
      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          extracting: true,
          files: state.pdfExtraction.files.map((file) =>
            file.id === id
              ? { ...file, status: "extracting", errors: [] }
              : file,
          ),
        },
      };
    }

    case EXTRACT_PDF_FILE_SUCCESS: {
      const { id, reviewData, editedData } = action.payload || {};
      const files = state.pdfExtraction.files.map((file) =>
        file.id === id
          ? {
              ...file,
              status: "success",
              reviewData,
              editedData,
              errors: [],
              touchedByPath: {},
            }
          : file,
      );
      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files,
          extracting: files.some((file) =>
            ["queued", "extracting"].includes(file.status),
          ),
        },
      };
    }

    case EXTRACT_PDF_FILE_FAILURE: {
      const { id, errors } = action.payload || {};
      const files = state.pdfExtraction.files.map((file) =>
        file.id === id
          ? {
              ...file,
              status: "failed",
              errors: Array.isArray(errors) ? errors : [String(errors || "")],
            }
          : file,
      );
      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files,
          extracting: files.some((file) =>
            ["queued", "extracting"].includes(file.status),
          ),
        },
      };
    }

    case UPDATE_PDF_REVIEW_FIELD: {
      const { id, path, value } = action.payload || {};
      if (!id || !Array.isArray(path)) return state;
      const pathKey = path.join(".");

      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files: state.pdfExtraction.files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  editedData: setByPath(file.editedData, path, value),
                  touchedByPath: {
                    ...(file.touchedByPath || {}),
                    [pathKey]: true,
                  },
                }
              : file,
          ),
        },
      };
    }

    case TOUCH_PDF_REVIEW_FIELD: {
      const { id, path } = action.payload || {};
      if (!id || !Array.isArray(path)) return state;
      const pathKey = path.join(".");

      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files: state.pdfExtraction.files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  touchedByPath: {
                    ...(file.touchedByPath || {}),
                    [pathKey]: true,
                  },
                }
              : file,
          ),
        },
      };
    }

    case UPDATE_PDF_REVIEW_MASTER_FIELD: {
      const { id, basePath, field } = action.payload || {};
      if (!id || !Array.isArray(basePath)) return state;
      const pathKey = basePath.join(".");

      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files: state.pdfExtraction.files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  editedData: setByPath(file.editedData, basePath, field),
                  touchedByPath: {
                    ...(file.touchedByPath || {}),
                    [pathKey]: true,
                  },
                }
              : file,
          ),
        },
      };
    }

    case SET_PDF_FILE_VALIDATION: {
      const { id, showErrors, errorsByPath } = action.payload || {};
      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files: state.pdfExtraction.files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  showErrors: Boolean(showErrors),
                  errorsByPath: errorsByPath || {},
                }
              : file,
          ),
        },
      };
    }

    case MARK_PDF_FILE_REVIEWED: {
      const { id, reviewed } = action.payload || {};
      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files: state.pdfExtraction.files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  reviewed: Boolean(reviewed),
                  showErrors: reviewed ? file.showErrors : false,
                  errorsByPath: reviewed ? file.errorsByPath : {},
                }
              : file,
          ),
        },
      };
    }

    case SET_ACTIVE_PDF_FILE:
      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          activeFileId: action.payload?.id ?? null,
        },
      };

    case REMOVE_PDF_FILE: {
      const { id } = action.payload || {};
      if (!id) return state;
      const remaining = state.pdfExtraction.files.filter((f) => f.id !== id);
      const wasActive = state.pdfExtraction.activeFileId === id;
      return {
        ...state,
        pdfExtraction: {
          ...state.pdfExtraction,
          files: remaining,
          activeFileId: wasActive
            ? (remaining[0]?.id ?? null)
            : state.pdfExtraction.activeFileId,
          extracting: remaining.some((f) =>
            ["queued", "extracting"].includes(f.status),
          ),
        },
      };
    }

    case CLEAR_PDF_EXTRACTION:
      return {
        ...state,
        pdfExtraction: {
          ...initialState.pdfExtraction,
        },
      };

    /* ---------------- Common request for all dropdowns ---------------- */

    case "FETCH_MPCI_MASTER_REQUEST": {
      const section = action.payload?.section;

      if (!section || !state[section]) {
        return { ...state, loading: true };
      }

      return {
        ...state,
        loading: true,
        [section]: {
          ...state[section],
          loading: true,
          error: null,
        },
      };
    }

    case "FETCH_MPCI_MASTER_SUCCESS": {
      const { section, targetField, data } = action.payload;

      if (!state[section] || !targetField) {
        console.warn("Invalid master update", action.payload);
        return state;
      }

      return {
        ...state,
        loading: false,
        [section]: {
          ...state[section],
          [targetField]: data,
          loading: false,
          error: null,
        },
      };
    }

    case "FETCH_MPCI_MASTER_FAILURE": {
      const section = action.payload?.section;

      if (!section || !state[section]) {
        return { ...state, loading: false };
      }

      return {
        ...state,
        loading: false,
        [section]: {
          ...state[section],
          loading: false,
          error:
            action.payload?.message || action.payload || "Master fetch failed",
        },
      };
    }
    /* ---------------- Party Lookup Actions like auto fill party name ---------------- */
    case FETCH_MPCI_PARTY_LOOKUP_REQUEST: {
      const fieldName = action.payload?.fieldName;
      if (!fieldName) return state;

      return {
        ...state,
        partyLookup: {
          ...state.partyLookup,
          byField: {
            ...state.partyLookup.byField,
            [fieldName]: {
              options: [],
              loading: true,
              error: null,
              query: action.payload?.partyName || "",
            },
          },
        },
      };
    }

    case FETCH_MPCI_PARTY_LOOKUP_SUCCESS: {
      const fieldName = action.payload?.fieldName;
      if (!fieldName) return state;

      const currentLookup = state.partyLookup.byField[fieldName];
      if (currentLookup?.query !== action.payload?.partyName) {
        return state;
      }

      return {
        ...state,
        partyLookup: {
          ...state.partyLookup,
          byField: {
            ...state.partyLookup.byField,
            [fieldName]: {
              options: Array.isArray(action.payload?.data)
                ? action.payload.data
                : [],
              loading: false,
              error: null,
              query: action.payload?.partyName || "",
            },
          },
        },
      };
    }

    case FETCH_MPCI_PARTY_LOOKUP_FAILURE: {
      const fieldName = action.payload?.fieldName;
      if (!fieldName) return state;

      const currentLookup = state.partyLookup.byField[fieldName];
      if (currentLookup?.query !== action.payload?.partyName) {
        return state;
      }

      return {
        ...state,
        partyLookup: {
          ...state.partyLookup,
          byField: {
            ...state.partyLookup.byField,
            [fieldName]: {
              options: [],
              loading: false,
              error: action.payload?.message || "Party lookup fetch failed",
              query: action.payload?.partyName || "",
            },
          },
        },
      };
    }

    case CLEAR_MPCI_PARTY_LOOKUP: {
      const fieldName = action.payload?.fieldName;

      if (!fieldName) {
        return {
          ...state,
          partyLookup: initialState.partyLookup,
        };
      }

      const nextByField = { ...state.partyLookup.byField };
      delete nextByField[fieldName];

      return {
        ...state,
        partyLookup: {
          ...state.partyLookup,
          byField: nextByField,
        },
      };
    }

    case CHANGE_AGENT_MPCI_DISPLAY_HEADERS:
      return {
        ...state,
        displayHeaders: Array.isArray(action.payload)
          ? action.payload
          : state.displayHeaders,
      };

    default:
      return state;
  }
};

export default DubaiMPCIReducer;
