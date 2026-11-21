export const canUsePdfExtraction = (loginUserData) =>
  // Boolean(loginUserData?.pdfGeminiEnabled) ||
  Boolean(loginUserData?.enablePdfExtraction);
