// Central pdfjs-dist setup for the HBL PDF extraction feature.
// Configures the worker (Vite resolves the ?url import to a bundled asset)
// and exposes a small helper used by the client-side page-count guard.
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export { pdfjsLib };

// Reads a PDF's page count without rendering it. Images are treated as 1 page
// by callers. Returns a number; throws if the file cannot be parsed as a PDF.
export const getPdfPageCount = async (file) => {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  const pageCount = doc.numPages;
  await doc.destroy();
  return pageCount;
};
