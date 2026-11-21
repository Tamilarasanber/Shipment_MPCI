import { memo, useCallback, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@/components/ui/mui";
import { CloudUploadIcon } from "@/components/ui/icons";
import { DeleteOutlineIcon } from "@/components/ui/icons";
import { InsertDriveFileIcon } from "@/components/ui/icons";
import { WarningAmberOutlinedIcon } from "@/components/ui/icons";
import { useDispatch } from "react-redux";
import {
  addPdfExtractionFiles,
  startPdfExtraction,
} from "@/redux/actions/dubaiMpciAction";
import { environment } from "@/environment/environment";
import { registerPdfExtractionFiles } from "../../pdfExtraction/pdfExtractionFileCache";
import { getPdfPageCount } from "./pdfjsSetup";

const SUPPORTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

const getExtension = (name = "") =>
  name.slice(name.lastIndexOf(".")).toLowerCase();

const isSupported = (file) => SUPPORTED_EXTENSIONS.includes(getExtension(file?.name || ""));
const isPdf = (file) =>
  file?.type === "application/pdf" || getExtension(file?.name || "") === ".pdf";

const fileRowSx = {
  p: 1.25,
  borderRadius: 1.5,
};

const acceptedRowSx = {
  ...fileRowSx,
  border: "1px solid #b5d4f4",
  bgcolor: "#eaf3fb",
};

const errorRowSx = {
  ...fileRowSx,
  border: "1px solid #f5c78a",
  bgcolor: "#fff8ed",
};

const PdfUploadPane = () => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [accepted, setAccepted] = useState([]);
  const [errors, setErrors] = useState([]);
  const [checking, setChecking] = useState(false);

  const { maxFiles, maxPdfPages } = environment.pdfExtraction || {};
  const fileCap = Number(maxFiles) || 10;
  const pageCap = Number(maxPdfPages) || 15;

  // Client-side guard: validate type + PDF page count before any upload.
  const validateFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []);
      const nextErrors = [];
      const nextAccepted = [];

      if (files.length > fileCap) {
        nextErrors.push(
          `You can upload up to ${fileCap} files (selected ${files.length}). Extra files were skipped.`,
        );
      }

      for (const file of files.slice(0, fileCap)) {
        if (!isSupported(file)) {
          nextErrors.push(`${file.name}: unsupported file type.`);
          continue;
        }

        if (isPdf(file)) {
          try {
            const pageCount = await getPdfPageCount(file);
            if (pageCount > pageCap) {
              nextErrors.push(
                `${file.name}: ${pageCount} pages exceeds the ${pageCap}-page limit.`,
              );
              continue;
            }
          } catch {
            nextErrors.push(`${file.name}: unable to read this PDF.`);
            continue;
          }
        }

        nextAccepted.push(file);
      }

      // setAccepted(nextAccepted);
      // setErrors(nextErrors);
      setAccepted((prev) => {
  const merged = [...prev];

  for (const file of nextAccepted) {
    const exists = merged.some(
      (f) =>
        f.name === file.name &&
        f.size === file.size &&
        f.lastModified === file.lastModified
    );

    if (!exists) {
      merged.push(file);
    }
  }

  return merged.slice(0, fileCap);
});
    },
    [fileCap, pageCap],
  );

  const handleInputChange = async (event) => {
    setChecking(true);
    await validateFiles(event.target.files);
    setChecking(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setChecking(true);
    await validateFiles(event.dataTransfer.files);
    setChecking(false);
  };

  const removeAccepted = (index) =>
    setAccepted((prev) => prev.filter((_, i) => i !== index));

  const handleStart = () => {
    if (!accepted.length) return;

    const files = accepted.map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: file.type || getExtension(file.name),
    }));

    registerPdfExtractionFiles(
      accepted.map((file, index) => ({ id: files[index].id, file })),
    );

    dispatch(addPdfExtractionFiles({ files }));
    dispatch(startPdfExtraction());
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", width: "100%" }}>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        sx={{
          border: "2px dashed #b5d4f4",
          borderRadius: 2,
          p: 5,
          textAlign: "center",
          bgcolor: "#f5f9fe",
          cursor: "pointer",
          "&:hover": { borderColor: "#1a7fd4", bgcolor: "#eaf3fb" },
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: "#1a7fd4", mb: 1 }} />
        <Typography fontWeight={600} color="text.secondary">
          Drop PDF / image files here or browse
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supported: PDF, PNG, JPG. Up to {fileCap} files. PDFs must be{" "}
          {pageCap} pages or fewer.
        </Typography>
      </Box>

      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        onChange={handleInputChange}
      />

      {checking && (
        <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
          Checking files…
        </Typography>
      )}

      {(accepted.length > 0 || errors.length > 0) && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {accepted.map((file, index) => (
            <Stack
              key={`${file.name}-${index}`}
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={acceptedRowSx}
            >
              <InsertDriveFileIcon color="primary" />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap fontWeight={600} variant="body2">
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => removeAccepted(index)}>
                <DeleteOutlineIcon color="error" fontSize="small" />
              </IconButton>
            </Stack>
          ))}

          {errors.map((message, index) => (
            <Stack
              key={`error-${index}`}
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={errorRowSx}
            >
              <WarningAmberOutlinedIcon sx={{ color: "#ed6c02" }} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ color: "#663c00" }}>
                  {message}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}

      <Box sx={{ mt: 3, textAlign: "right" }}>
        <Button
          variant="contained"
          disabled={!accepted.length || checking}
          onClick={handleStart}
          sx={{ textTransform: "none" }}
        >
          Extract {accepted.length ? `(${accepted.length})` : ""}
        </Button>
      </Box>
    </Box>
  );
};

export default memo(PdfUploadPane);
