const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const validateAttachment = (file) => {
  if (!file) return "File is required";

  if (!SUPPORTED_TYPES.includes(file.type)) {
    return "Only jpeg, jpg, png, pdf files are allowed";
  }

  if (file.size > MAX_SIZE) {
    return "File size should not exceed 10MB";
  }

  return null;
};