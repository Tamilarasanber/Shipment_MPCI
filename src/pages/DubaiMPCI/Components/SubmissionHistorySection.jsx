import React, { useMemo, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  Stack,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@/components/ui/mui";
import { RefreshRoundedIcon } from "@/components/ui/icons";
import { VisibilityOutlinedIcon } from "@/components/ui/icons";
import { CloseIcon } from "@/components/ui/icons";
import { DownloadIcon } from "@/components/ui/icons";

import { useDispatch, useSelector } from "react-redux";
import { fetchSubmissionHistoryRequest } from "@/redux/actions/dubaiMpciAction";

const STATUS_STYLES = {
  submitted: {
    bg: "#FFF3E0",
    color: "#EF6C00",
  },
  accepted: {
    bg: "#E8F5E9",
    color: "#2E7D32",
  },
  rejected: {
    bg: "#FDECEA",
    color: "#D32F2F",
  },
  pending: {
    bg: "#E3F2FD",
    color: "#1976D2",
  },
};

const TABLE_HEADERS = [
  "#",
  "Submission Date & Time",
  "User",
  "Action Code",
  "File Type",
  "Status",
  "No. of HBLs",
  "HBL Numbers",
  "Disposition Code",
  "Action",
];

const RFI_SEGMENTS = new Set(["NAD", "LOC", "SAD"]);

const getStatusStyle = (status = "") => {
  const statusKey = String(status || "").toLowerCase();
  return (
    STATUS_STYLES[statusKey] || {
      bg: "#EEF2FF",
      color: "#1E3A8A",
    }
  );
};

const extractSegment = (value = "") => {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  if (!raw) return "";
  const segment = raw.split(/[^A-Z]/)[0] || raw.slice(0, 3);
  return RFI_SEGMENTS.has(segment) ? segment : "";
};

const SubmissionHistorySection = ({ onRefresh, masterId }) => {
  const dispatch = useDispatch();
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { submissionHistoryList = [], loading } = useSelector(
    (state) => state.DubaiFormFiling.submissionHistory,
  );
  const { themeDetails } = useSelector((state) => state.Theme);

  const handleRefreshClick = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    if (!masterId) return;
    dispatch(fetchSubmissionHistoryRequest({ masterId }));
  };

  const cuscarMessage = useMemo(
    () => selectedRow?.cuscarEdiMessage || selectedRow?.ediResponse || "",
    [selectedRow],
  );

  const showResponseCode = !!selectedRow?.dispositionCode;
  const selectedCuscarMessage =
    cuscarMessage.split("'").filter(Boolean).join("'\n") + "'";

  const selectedRfiRows = useMemo(() => {
    if (String(selectedRow?.dispositionCode || "").toUpperCase() !== "RFI") {
      return [];
    }

    const rows = Array.isArray(selectedRow?.rfiResponses)
      ? selectedRow.rfiResponses
      : [];

    return rows
      .map((item) => {
        const segment = extractSegment(item?.errorLocation);
        return {
          segment,
          position: item?.errorIdentifier || "",
          rfiCode: item?.requirementType || "",
          rfiTypeDescription: item?.requirementTypeDescription || "",
          naicMessage: item?.requirementText || "",
        };
      })
      .filter((item) => item.segment);
  }, [selectedRow]);

  const openResponseDialog = (row) => {
    setSelectedRow(row);
    setResponseDialogOpen(true);
  };

  const closeResponseDialog = () => {
    setResponseDialogOpen(false);
    setSelectedRow(null);
  };

  const openPreviewDialog = () => {
    setResponseDialogOpen(false);
    setPreviewDialogOpen(true);
  };

  const closePreviewDialog = () => {
    setPreviewDialogOpen(false);
    setSelectedRow(null);
  };

  const downloadCuscarMessage = () => {
    if (!selectedCuscarMessage) return;
    const fileName = `CUSCAR-null${Date.now()}.txt`;
    const blob = new Blob([selectedCuscarMessage], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };
  const showDispositionCode = !!selectedRow?.dispositionCode;
  const showContrError =
    Array.isArray(selectedRow?.contrlErrors) &&
    selectedRow.contrlErrors.length > 0;

  const tableScrollSx = {
    border: "1px solid #e2e8f0",
    borderRadius: 2,
    backgroundColor: "#fff",
    overflow: "auto",
    width: "100%",
    maxWidth: "100%",
    minHeight: 0,

    scrollbarGutter: "stable both-edges",
    scrollbarWidth: "auto",
    scrollbarColor: "#94a3b8 #e2e8f0",
    WebkitOverflowScrolling: "touch",

    "&::-webkit-scrollbar": {
      width: 12,
      height: 12,
    },

    "&::-webkit-scrollbar-track": {
      backgroundColor: "#e2e8f0",
      borderRadius: 10,
    },

    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#94a3b8",
      borderRadius: 10,
      border: "2px solid #e2e8f0",
    },

    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#64748b",
    },
  };
  return (
    <>
      <Paper
        sx={{
          borderRadius: "14px",
          border: "1px solid #E6ECF3",
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.2,
            borderBottom: "1px solid #E6ECF3",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#475569",
                letterSpacing: 0.3,
              }}
            >
              Refresh
            </Typography>
            <Tooltip title="Refresh status & submission history">
              <span>
                <IconButton
                  size="small"
                  onClick={handleRefreshClick}
                  disabled={loading}
                  sx={{
                    border: "1px solid #dbe4f0",
                    bgcolor: "#fff",
                    "&:hover": { bgcolor: "#eef4ff" },
                  }}
                >
                  <RefreshRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        <TableContainer
          sx={{
            maxHeight: 460,
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ background: "#F5F7FB" }}>
                {TABLE_HEADERS.map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      color: "#5B6B83",
                      borderBottom: "1px solid #E6ECF3",
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {submissionHistoryList?.map((row, index) => {
                const statusStyle = getStatusStyle(row.mpciStatus);

                return (
                  <TableRow
                    key={`${row.interchangeId || "row"}-${index}`}
                    sx={{
                      transition: "all .2s ease",
                      "&:nth-of-type(even)": { background: "#FAFBFD" },
                      "&:hover": { background: "#F0F6FF" },
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ minWidth: 130, width: 130 }}>
                      {row.submitDateTime ? (
                        <>
                          <Typography variant="body2" fontWeight={500}>
                            {row.submitDateTime.split("T")[0]}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {row.submitDateTime.split("T")[1]}
                          </Typography>
                        </>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{row.user || "-"}</TableCell>
                    <TableCell>{row.actionCode || "-"}</TableCell>
                    <TableCell>{row.fileType || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.mpciStatus || "-"}
                        size="small"
                        sx={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.hblCount || "-"}</TableCell>
                    <TableCell
                      sx={{
                        minWidth: 180,
                        maxWidth: 180,
                      }}
                    >
                      {Array.isArray(row.hblList) && row.hblList.length > 0
                        ? row.hblList.map((hbl, index) => (
                            <Typography key={index} variant="body2">
                              {hbl}
                            </Typography>
                          ))
                        : "-"}
                    </TableCell>
                    <TableCell>{row.dispositionCode || ""}</TableCell>
                    <TableCell>
                      <Tooltip title="View EDI response">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => openResponseDialog(row)}
                            sx={{
                              border: "1px solid #dbe4f0",
                              bgcolor: "#fff",
                              "&:hover": { bgcolor: "#eef4ff" },
                            }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && submissionHistoryList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography sx={{ py: 3, color: "#8A94A6" }}>
                      No submission history available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={responseDialogOpen}
        onClose={closeResponseDialog}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "90%",
            maxWidth: "90%",
            // height:"70vh"
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            background: themeDetails.AccordionBackgroundColor,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          EDI Request
          <IconButton onClick={closeResponseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <TableContainer sx={tableScrollSx}>
            <Table size="small" sx={{ my: 1 }}>
              <TableHead>
                <TableRow sx={{ background: "#F5F7FB" }}>
                  {showDispositionCode && (
                    <TableCell sx={{ fontWeight: 700 }}>ResponseCode</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700 }}>Action Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>File Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>No. Of HBL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>HBL Numbers</TableCell>
                  {showContrError && (
                    <>
                      <TableCell sx={{ fontWeight: 700 }}>Error Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Field</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Error Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Error Name</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedRow &&
                  (showContrError ? (
                    selectedRow.contrlErrors.map((error, index) => (
                      <TableRow key={index}>
                        {showDispositionCode && (
                          <TableCell>{selectedRow.dispositionCode}</TableCell>
                        )}

                        <TableCell>{selectedRow.actionCode || "-"}</TableCell>
                        <TableCell>{selectedRow.fileType || "-"}</TableCell>
                        <TableCell>{selectedRow.mpciStatus || "-"}</TableCell>
                        <TableCell>{selectedRow.hblCount || "-"}</TableCell>

                        <TableCell>
                          {selectedRow.hblList?.join(", ") || "-"}
                        </TableCell>

                        <TableCell
                          sx={{
                            width: "100px",
                            minWidth: "100px",
                            maxWidth: "100px",
                            // verticalAlign: "top",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {error.errorCode || "-"}
                        </TableCell>
                        <TableCell>{error.fieldLabel || "-"}</TableCell>

                        <TableCell
                          sx={{
                            width: "340px",
                            minWidth: "340px",
                            maxWidth: "340px",
                            verticalAlign: "top",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            lineHeight: 1.45,
                          }}
                        >
                          {error.errorDescription || "-"}
                        </TableCell>

                        <TableCell
                          sx={{
                            width: "300px",
                            minWidth: "300px",
                            maxWidth: "300px",
                            verticalAlign: "top",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            lineHeight: 1.45,
                          }}
                        >
                          {error.errorName || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      {showDispositionCode && (
                        <TableCell>{selectedRow.dispositionCode}</TableCell>
                      )}

                      <TableCell>{selectedRow.actionCode || "-"}</TableCell>
                      <TableCell>{selectedRow.fileType || "-"}</TableCell>
                      <TableCell>{selectedRow.mpciStatus || "-"}</TableCell>
                      <TableCell>{selectedRow.hblCount || "-"}</TableCell>

                      <TableCell>
                        {selectedRow.hblList?.join(", ") || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedRfiRows.length > 0 && (
            <TableContainer sx={tableScrollSx}>
              <Table size="small" sx={{ my: 1 }}>
                <TableHead>
                  <TableRow sx={{ background: "#F5F7FB" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Segment</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>RFI Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>RFI Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>NAIC Message</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>No. Of HBL</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>HBL Numbers</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRfiRows.map((item, index) => (
                    <TableRow key={`rfi-${index}`}>
                      <TableCell>{item.segment}</TableCell>
                      <TableCell>{item.position}</TableCell>
                      <TableCell>{item.rfiCode}</TableCell>
                      <TableCell>
                        {item.rfiTypeDescription
                          ? `NAIC Required ${item.rfiTypeDescription}`
                          : "NAIC Required"}
                      </TableCell>
                      <TableCell>{item.naicMessage}</TableCell>
                      <TableCell>{selectedRow.hblCount || ""}</TableCell>
                      <TableCell>
                        {Array.isArray(selectedRow?.hblList) &&
                        selectedRow.hblList.length > 0
                          ? selectedRow.hblList.join(", ")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button
            variant="contained"
            onClick={openPreviewDialog}
            disabled={!selectedCuscarMessage}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            onClick={closeResponseDialog}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewDialogOpen}
        onClose={closePreviewDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#112b72",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          EDI Request
          <IconButton onClick={closePreviewDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            fullWidth
            multiline
            minRows={12}
            value={selectedCuscarMessage}
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: "Consolas, Monaco, monospace",
                fontSize: "0.9rem",
                lineHeight: 1.5,
                alignItems: "flex-start",
                padding: "5px !important",
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadCuscarMessage}
            disabled={!selectedCuscarMessage}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            onClick={closePreviewDialog}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubmissionHistorySection;
