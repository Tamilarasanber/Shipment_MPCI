// In-memory File cache for the PDF extraction flow.
// File blobs must not live in Redux (non-serializable). Redux stores metadata
// by id; this map holds the actual File for viewer + API upload.

const filesById = new Map();

export const registerPdfExtractionFiles = (entries = []) => {
  entries.forEach(({ id, file }) => {
    if (id && file instanceof File) {
      filesById.set(id, file);
    }
  });
};

export const getPdfExtractionFile = (id) =>
  id ? filesById.get(id) ?? null : null;

export const removePdfExtractionFile = (id) => {
  if (id) filesById.delete(id);
};

export const clearPdfExtractionFileCache = () => {
  filesById.clear();
};
