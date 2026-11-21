export const environment = {
  production: false,
  serverURL: import.meta.env.VITE_API_SERVER_URL || "https://dev-webtool.newage-nxt.com",
  pdfExtraction: {
    maxFiles: 10,
    maxPdfPages: 5,
    processingMode: "sequential",
    maxConcurrency: 3,
  },
};
