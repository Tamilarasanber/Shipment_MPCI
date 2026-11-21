import { memo, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Toolbar,
  Typography,
} from "@/components/ui/mui";
import { CloseIcon } from "@/components/ui/icons";
import { CheckCircleIcon } from "@/components/ui/icons";
import { DescriptionOutlinedIcon } from "@/components/ui/icons";
import { ErrorOutlineIcon } from "@/components/ui/icons";
import { ExpandLessIcon } from "@/components/ui/icons";
import { ExpandMoreIcon } from "@/components/ui/icons";
import { HourglassEmptyIcon } from "@/components/ui/icons";
import { ReplayIcon } from "@/components/ui/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  clearPdfExtraction,
  markPdfFileReviewed,
  removePdfFile,
  retryPdfFile,
  setActivePdfFile,
  setPdfFileValidation,
} from "@/redux/actions/dubaiMpciAction";
import { mapReviewedPdfToHBL } from "../../MapperLayer/mapReviewedPdfToHBL";
import { validatePdfReview } from "../../pdfExtraction/pdfReviewValidation";
import {
  clearPdfExtractionFileCache,
  getPdfExtractionFile,
  removePdfExtractionFile,
} from "../../pdfExtraction/pdfExtractionFileCache";
import DocumentViewer from "./DocumentViewer";
import PdfReviewForm from "./PdfReviewForm";
import PdfUploadPane from "./PdfUploadPane";

const statusChipProps = (status) => {
  switch (status) {
    case "success":
      return { color: "success", icon: <DescriptionOutlinedIcon /> };
    case "failed":
      return { color: "error", icon: <ErrorOutlineIcon /> };
    case "extracting":
      return { color: "info", icon: <CircularProgress size={14} /> };
    default:
      return { color: "default", icon: <HourglassEmptyIcon /> };
  }
};

const PdfExtractionModal = ({ open, onClose, onPopulateHbls }) => {
  const dispatch = useDispatch();
  const { files, activeFileId } = useSelector(
    (state) => state.DubaiFormFiling?.pdfExtraction || {},
  );
  const { themeDetails } = useSelector((state) => state.Theme);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // No persistence: every open starts from a clean slate; every close discards
  // all uploaded files, extracted data, and edits.
  useEffect(() => {
    if (open) {
      clearPdfExtractionFileCache();
      dispatch(clearPdfExtraction());
      setSummaryCollapsed(false);
    }
  }, [open, dispatch]);

  const handleClose = () => {
    clearPdfExtractionFileCache();
    dispatch(clearPdfExtraction());
    onClose();
  };

  const handleRemoveFile = (id) => {
    removePdfExtractionFile(id);
    dispatch(removePdfFile({ id }));
  };

  const fileList = Array.isArray(files) ? files : [];
  const isFullScreen = fileList.length > 0;
  const reviewedFiles = useMemo(
    () =>
      fileList.filter(
        (file) => file.reviewed && file.status === "success" && file.editedData,
      ),
    [fileList],
  );
  const unreviewedCount = fileList.length - reviewedFiles.length;
  const activeFile =
    fileList.find((file) => file.id === activeFileId) || fileList[0] || null;

  useEffect(() => {
    setSummaryCollapsed(false);
  }, [activeFile?.id]);

  const validationResult = useMemo(() => {
    if (
      !activeFile ||
      activeFile.status !== "success" ||
      activeFile.reviewed ||
      !activeFile.editedData
    ) {
      return null;
    }
    return validatePdfReview(activeFile.editedData);
  }, [
    activeFile?.id,
    activeFile?.status,
    activeFile?.reviewed,
    activeFile?.editedData,
  ]);

  const visibleErrorsByPath = useMemo(() => {
    if (!validationResult || !activeFile) return {};

    const { errorsByPath } = validationResult;
    const touched = activeFile.touchedByPath || {};
    const showAll = Boolean(activeFile.showErrors);

    if (showAll) return errorsByPath;

    return Object.fromEntries(
      Object.entries(errorsByPath).filter(([key]) => touched[key]),
    );
  }, [validationResult, activeFile?.showErrors, activeFile?.touchedByPath]);

  const validationSummaryLabels = useMemo(() => {
    if (!validationResult || !activeFile) {
      return { entries: [], total: 0, showAll: false };
    }

    const touched = activeFile.touchedByPath || {};
    const showAll = Boolean(activeFile.showErrors);
    const isVisible = (path) => showAll || touched[path];

    const entries = [
      ...validationResult.missingMandatory
        .filter((entry) => isVisible(entry.path))
        .map((entry) => `${entry.label}: ${entry.message}`),
      ...validationResult.unsyncedMasters
        .filter((entry) => isVisible(entry.path))
        .map((entry) => `${entry.label}: ${entry.message}`),
    ];

    return {
      entries,
      total: entries.length,
      showAll,
    };
  }, [validationResult, activeFile?.showErrors, activeFile?.touchedByPath]);

  const handleMarkReviewedChange = (checked) => {
    if (!activeFile) return;

    if (!checked) {
      dispatch(markPdfFileReviewed({ id: activeFile.id, reviewed: false }));
      return;
    }

    const result = validatePdfReview(activeFile.editedData);
    if (!result.isValid) {
      dispatch(
        setPdfFileValidation({
          id: activeFile.id,
          showErrors: true,
          errorsByPath: {},
        }),
      );
      setSummaryCollapsed(false);
      return;
    }

    dispatch(
      setPdfFileValidation({
        id: activeFile.id,
        showErrors: false,
        errorsByPath: {},
      }),
    );
    dispatch(markPdfFileReviewed({ id: activeFile.id, reviewed: true }));
  };

  const handleValidateClick = () => {
    if (!reviewedFiles.length) return;
    setConfirmOpen(true);
  };

  // const handleConfirmPopulate = () => {
  //   if (!reviewedFiles.length || typeof onPopulateHbls !== "function") {
  //     setConfirmOpen(false);
  //     return;
  //   }

  //   const hbls = reviewedFiles.map((file) =>
  //     mapReviewedPdfToHBL(file.editedData),
  //   );
  //   onPopulateHbls(hbls);

  //   reviewedFiles.forEach((file) => {
  //     removePdfExtractionFile(file.id);
  //     dispatch(removePdfFile({ id: file.id }));
  //   });

  //   setConfirmOpen(false);
  // };
  const handleConfirmPopulate = () => {
    if (!reviewedFiles.length || typeof onPopulateHbls !== "function") {
      setConfirmOpen(false);
      return;
    }

    const hbls = reviewedFiles.map((file) =>
      mapReviewedPdfToHBL(file.editedData),
    );

    // Populate HBL details
    onPopulateHbls(hbls);

    // Close confirmation popup
    setConfirmOpen(false);

    // Close full "Extract HBL Data from PDF / Image" modal
    handleClose();
  };

  const renderRightPane = () => {
    if (!activeFile) return null;

    if (activeFile.status === "extracting" || activeFile.status === "queued") {
      return (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ height: "100%" }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Extracting data…
          </Typography>
        </Stack>
      );
    }

    if (activeFile.status === "failed") {
      return (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ height: "100%", p: 3, textAlign: "center" }}
        >
          <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
          <Typography color="error" fontWeight={600}>
            Invalid Document
          </Typography>
          {(activeFile.errors || []).map((message, index) => (
            <Typography key={index} variant="body2" color="text.secondary">
              {typeof message === "string"
                ? message
                : message?.message || JSON.stringify(message)}
            </Typography>
          ))}
          <Button
            variant="contained"
            startIcon={<ReplayIcon />}
            onClick={() => dispatch(retryPdfFile({ id: activeFile.id }))}
            sx={{ textTransform: "none" }}
          >
            Retry
          </Button>
        </Stack>
      );
    }

    return (
      <PdfReviewForm
        fileId={activeFile.id}
        editedData={activeFile.editedData}
        showErrors
        errorsByPath={visibleErrorsByPath}
        locked={Boolean(activeFile.reviewed)}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isFullScreen}
      fullWidth={!isFullScreen}
      maxWidth={false}
      PaperProps={{
        sx: !isFullScreen
          ? {
              width: "80vw",
              height: "90vh",
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 2,
            }
          : {},
      }}
    >
      <AppBar
        position="sticky"
        sx={{ background: themeDetails?.AccordionBackgroundColor || "#1a7fd4" }}
      >
        <Toolbar variant="dense">
          <Typography sx={{ flex: 1, fontWeight: 700 }}>
            Extract HBL Data from PDF / Image
          </Typography>
          <Button
            disabled={reviewedFiles.length === 0}
            variant="outlined"
            onClick={handleValidateClick}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.5)",
              mr: 1,
              textTransform: "none",
            }}
          >
            Add HBL
            {reviewedFiles.length > 0 ? ` (${reviewedFiles.length})` : ""}
          </Button>
          <IconButton edge="end" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {!fileList.length ? (
        <Box sx={{ p: 4, height: "100%", overflow: "auto" }}>
          <PdfUploadPane />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100% - 48px)",
          }}
        >
          {/* Per-file tabs (chips) */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              px: 2,
              py: 1,
              overflowX: "auto",
              borderBottom: "1px solid #e0e0e0",
              flexShrink: 0,
              // Firefox
              scrollbarWidth: "auto",
              scrollbarColor: "rgb(148, 163, 184) rgb(226, 232, 240)",

              // Chrome, Edge, Safari
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                background: "rgb(226, 232, 240)",
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgb(148, 163, 184)",
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgb(100, 116, 139)",
              },

              // CSS property (supported in modern browsers)
              scrollbarGutter: "stable both-edges",
            }}
          >
            {fileList.map((file) => {
              const chip = statusChipProps(file.status);
              return (
                <Chip
                  key={file.id}
                  icon={chip.icon}
                  color={file.id === activeFile?.id ? chip.color : "default"}
                  variant={file.id === activeFile?.id ? "filled" : "outlined"}
                  label={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <span>{file.fileName}</span>
                      {file.reviewed && (
                        <CheckCircleIcon sx={{ fontSize: 14 }} />
                      )}
                    </Stack>
                  }
                  onClick={() => dispatch(setActivePdfFile({ id: file.id }))}
                  onDelete={() => handleRemoveFile(file.id)}
                  sx={{ maxWidth: 260 }}
                />
              );
            })}
          </Stack>

          {/* Split view: document left, review form right */}
          <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
            <Box
              sx={{
                width: "50%",
                borderRight: "1px solid #e0e0e0",
                minHeight: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <DocumentViewer file={getPdfExtractionFile(activeFile?.id)} />
            </Box>
            <Box
              sx={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {activeFile?.status === "success" && (
                <Stack
                  spacing={1}
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderBottom: "1px solid #eee",
                    flexShrink: 0,
                  }}
                >
                  <Stack direction="row" justifyContent="flex-end">
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={Boolean(activeFile.reviewed)}
                          onChange={(event) =>
                            handleMarkReviewedChange(event.target.checked)
                          }
                        />
                      }
                      label="Mark as reviewed"
                    />
                  </Stack>
                  {validationSummaryLabels.total > 0 && (
                    <Alert severity="warning" sx={{ py: 0.5 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: summaryCollapsed ? 0 : 0.5 }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {validationSummaryLabels.showAll
                            ? `Cannot mark as reviewed (${validationSummaryLabels.total} ${
                                validationSummaryLabels.total === 1
                                  ? "error"
                                  : "errors"
                              })`
                            : `${validationSummaryLabels.total} field${
                                validationSummaryLabels.total === 1 ? "" : "s"
                              } need attention`}
                        </Typography>
                        <IconButton
                          size="small"
                          aria-label={
                            summaryCollapsed
                              ? "Expand validation errors"
                              : "Collapse validation errors"
                          }
                          onClick={() => setSummaryCollapsed((prev) => !prev)}
                          sx={{ ml: 1 }}
                        >
                          {summaryCollapsed ? (
                            <ExpandMoreIcon fontSize="small" />
                          ) : (
                            <ExpandLessIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Stack>
                      <Collapse in={!summaryCollapsed}>
                        <Box
                          component="ul"
                          sx={{
                            m: 0,
                            pl: 2.5,
                            maxHeight: 120,
                            overflow: "auto",
                          }}
                        >
                          {validationSummaryLabels.entries.map(
                            (label, index) => (
                              <Typography
                                component="li"
                                variant="body2"
                                key={`${label}-${index}`}
                                sx={{ mb: 0.25 }}
                              >
                                {label}
                              </Typography>
                            ),
                          )}
                        </Box>
                      </Collapse>
                    </Alert>
                  )}
                </Stack>
              )}
              <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                {renderRightPane()}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Reviewed HBL?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {/* {reviewedFiles.length} of {fileList.length} file
            {fileList.length === 1 ? "" : "s"} marked as reviewed will be added
            to the HBL Details section.
            {unreviewedCount > 0
              ? ` The remaining ${unreviewedCount} un-reviewed file${
                  unreviewedCount === 1 ? "" : "s"
                } will stay in this modal.`
              : " All files in this modal will be moved."} */}
            The reviewed HBL will be added to the MPCI filling.
          </DialogContentText>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {reviewedFiles.map((file) => (
              <Typography component="li" variant="body2" key={file.id}>
                {file.fileName}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPopulate}
            sx={{ textTransform: "none" }}
          >
            Add HBL
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default memo(PdfExtractionModal);
