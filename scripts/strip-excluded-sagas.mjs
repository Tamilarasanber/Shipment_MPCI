import fs from "fs";

const file = "src/redux/sagas/dubaiMpciSaga.js";
let text = fs.readFileSync(file, "utf8");

const names = [
  "fetchAgentMPCIHBLListSaga",
  "fetchMPCILinkHBLSaga",
  "downloadMpciTemplateSaga",
  "validateMpciExcelSaga",
  "downloadMpciErrorReportSaga",
  "proceedMpciValidatedHblsSaga",
  "proceedMpciAllHblsSaga",
];

for (const name of names) {
  const token = `function* ${name}`;
  const start = text.indexOf(token);
  if (start < 0) continue;
  const rest = text.slice(start + token.length);
  const next = rest.search(/\nfunction\* |\nfunction |\nexport default/);
  const end = next < 0 ? text.length : start + token.length + next;
  text = `${text.slice(0, start)}${text.slice(end)}`;
}

text = text.replace(/yield takeLatest\(\s*FETCH_AGENT_MPCI_HBL_LIST_REQUEST,[\s\S]*?\);/g, "");
text = text.replace(/yield takeLatest\(FETCH_MPCI_LINK_HBL_DETAILS_REQUEST, fetchMPCILinkHBLSaga\);/g, "");
text = text.replace(/yield takeLatest\(DOWNLOAD_MPCI_TEMPLATE_REQUEST, downloadMpciTemplateSaga\);/g, "");
text = text.replace(/yield takeLatest\(VALIDATE_MPCI_EXCEL_REQUEST, validateMpciExcelSaga\);/g, "");
text = text.replace(/yield takeLatest\(\s*DOWNLOAD_MPCI_ERROR_REPORT_REQUEST,[\s\S]*?\);/g, "");
text = text.replace(/yield takeLatest\(\s*PROCEED_MPCI_VALIDATED_HBLS_REQUEST,[\s\S]*?\);/g, "");
text = text.replace(/yield takeLatest\(PROCEED_MPCI_ALL_HBLS_REQUEST, proceedMpciAllHblsSaga\);/g, "");

const dropImports = [
  "FETCH_AGENT_MPCI_HBL_LIST_REQUEST",
  "FETCH_AGENT_MPCI_HBL_LIST_SUCCESS",
  "FETCH_AGENT_MPCI_HBL_LIST_FAILURE",
  "FETCH_MPCI_LINK_HBL_DETAILS_REQUEST",
  "FETCH_MPCI_LINK_HBL_DETAILS_SUCCESS",
  "FETCH_MPCI_LINK_HBL_DETAILS_FAILURE",
  "DOWNLOAD_MPCI_TEMPLATE_REQUEST",
  "VALIDATE_MPCI_EXCEL_REQUEST",
  "DOWNLOAD_MPCI_ERROR_REPORT_REQUEST",
  "PROCEED_MPCI_VALIDATED_HBLS_REQUEST",
  "PROCEED_MPCI_ALL_HBLS_REQUEST",
  "downloadMpciTemplateSuccess",
  "downloadMpciTemplateFailure",
  "validateMpciExcelSuccess",
  "validateMpciExcelFailure",
  "downloadMpciErrorReportSuccess",
  "downloadMpciErrorReportFailure",
  "proceedMpciValidatedHblsSuccess",
  "proceedMpciValidatedHblsFailure",
  "proceedMpciAllHblsSuccess",
  "proceedMpciAllHblsFailure",
  "fetchAgentMPCIhblList",
  "fetchMPCIhbllLink",
  "downloadMpciTemplateApi",
  "validateMpciExcelApi",
  "downloadMpciErrorReportApi",
  "proceedMpciValidatedHblsApi",
  "proceedMpciAllHblsApi",
];

dropImports.forEach((name) => {
  text = text.replace(new RegExp(`\\n\\s*${name},?`, "g"), "\n");
});

fs.writeFileSync(file, text);
console.log("stripped saga");
