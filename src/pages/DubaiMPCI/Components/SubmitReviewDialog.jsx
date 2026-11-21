import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Stack,
  Checkbox,
  Tooltip,
} from "@/components/ui/mui";
import { CloseIcon } from "@/components/ui/icons";
import { LocalShippingIcon } from "@/components/ui/icons";
import { DescriptionIcon } from "@/components/ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchMPCIPreviewRequest } from "@/redux/actions/dubaiMpciAction";
import TruncateText from "@/components/ui/TruncateText";

const DEFAULT_STATUS = "Pending";

const displayValue = (value) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const normalizeStatusValue = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const getFilingLockMessage = (row) => {
  const status = normalizeStatusValue(row?.status);
  const actionCode = String(row?.actionCode ?? "").trim();

  if (status === "SUBMITTED") {
    return "Filing Already SUBMITTED";
  }

  if (actionCode === "" && status === "ACCEPTED") {
    return "Filing Already ACCEPTED";
  }

  return "";
};

const hasSelectableBlId = (row) => {
  const blId = Number(row?.blId);
  return Number.isFinite(blId) && blId > 0 && !getFilingLockMessage(row);
};

const checkboxCellSx = {
  width: 56,
  p: 0,
  verticalAlign: "middle",
  borderBottom: "1px solid #e6eaf0",
  lineHeight: "normal",
};

const checkboxSx = {
  p: 0.5,
};

const SubmitReviewDialog = ({
  open,
  onClose,
  onPreviewAction,
  onSubmitAction,
  submitDisabled,
  submitLoading,
  themeDetails,
}) => {
  const dispatch = useDispatch();
  const { data: selectedMPCIDetails } = useSelector(
    (state) => state.DubaiFormFiling?.selectedMPCIDetails || {},
  );
  const { statusList = [] } = useSelector(
    (state) => state.DubaiFormFiling?.status || {},
  );
  const { downloading: previewDownloading } = useSelector(
    (state) => state.DubaiFormFiling?.preview || {},
  );
  const { loginUserData } = useSelector((state) => state.Login);
  const isEnableEdiView = Boolean(loginUserData?.enableEdiView);
  const [selectedBlIds, setSelectedBlIds] = useState([]);

  const blByHblNo = useMemo(() => {
    const map = new Map();
    const blDetailsList = Array.isArray(selectedMPCIDetails?.blDetailsList)
      ? selectedMPCIDetails.blDetailsList
      : [];

    for (const bl of blDetailsList) {
      const hblNo = String(bl?.hblNo || "").trim();
      const blId = Number(bl?.id);
      if (!hblNo || !Number.isFinite(blId) || blId <= 0) continue;
      map.set(hblNo, {
        blId,
        actionCode: String(bl?.actionCode ?? "").trim(),
      });
    }

    return map;
  }, [selectedMPCIDetails]);

  const rows = useMemo(() => {
    const list = Array.isArray(statusList) ? statusList : [];

    return list.map((statusRow, index) => {
      const hblNo = String(statusRow?.hblNo || "").trim();
      const status = String(statusRow?.status ?? "").trim();
      const bl = blByHblNo.get(hblNo);

      return {
        id: hblNo || index,
        blId: bl?.blId,
        hblNo: hblNo || `HBL ${index + 1}`,
        shipper: displayValue(statusRow?.shipper),
        consignee: displayValue(statusRow?.consignee),
        status: status || DEFAULT_STATUS,
        actionCode: bl?.actionCode ?? "",
      };
    });
  }, [blByHblNo, statusList]);

  useEffect(() => {
    if (!open) return;

    // setSelectedBlIds(
    //   rows
    //     .map((row) => Number(row?.blId))
    //     .filter((blId) => Number.isFinite(blId) && blId > 0),
    // );
    setSelectedBlIds([]);
  }, [open]);

  const allSelectableBlIds = useMemo(
    () => rows.filter(hasSelectableBlId).map((row) => Number(row.blId)),
    [rows],
  );

  const hasSelection = selectedBlIds.length > 0;
  const isAllSelected =
    allSelectableBlIds.length > 0 &&
    allSelectableBlIds.every((blId) => selectedBlIds.includes(blId));

  const toggleSelectAll = (checked) => {
    setSelectedBlIds(checked ? allSelectableBlIds : []);
  };

  const toggleRowSelection = (blId) => {
    setSelectedBlIds((prev) =>
      prev.includes(blId) ? prev.filter((id) => id !== blId) : [...prev, blId],
    );
  };

  const handlePreviewRequest = () => {
    const masterId = Number(
      selectedMPCIDetails?.masterId || selectedMPCIDetails?.id,
    );

    if (!Number.isFinite(masterId) || masterId <= 0 || !hasSelection) return;

    dispatch(
      fetchMPCIPreviewRequest({
        masterId,
        blIds: selectedBlIds,
      }),
    );
  };

  const hasSubmittedSelection = useMemo(() => {
    return rows.some(
      (row) => selectedBlIds.includes(row.blId) && row.status === "SUBMITTED",
    );
  }, [rows, selectedBlIds]);

  const hasAcceptedEmptyActionSelection = useMemo(() => {
    return rows.some(
      (row) =>
        selectedBlIds.includes(row.blId) &&
        String(row.actionCode ?? "").trim() === "" &&
        normalizeStatusValue(row.status) === "ACCEPTED",
    );
  }, [rows, selectedBlIds]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        onClose();
      }}
      fullWidth
      maxWidth="xl"
      sx={{
        "& .MuiDialog-paper": {
          width: "96%",
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          background: themeDetails.AccordionBackgroundColor,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <LocalShippingIcon />
          <Typography fontWeight={600}>EDI Filing Review</Typography>
        </Stack>

        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ color: "#fff" }} />
        </IconButton>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent
        sx={{
          backgroundColor: "#f8fafc",
          p: 3,
        }}
      >
        {/* Summary */}
        {/* <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Total House Bills
          </Typography>

          <Typography variant="h6" fontWeight={600}>
            {rows.length}
          </Typography>
        </Box> */}

        {/* TABLE */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid #e6eaf0",
            overflow: "hidden",
          }}
        >
          <Table
            size="small"
            sx={{
              borderCollapse: "collapse",
              "& .MuiTableCell-root": {
                borderBottom: "1px solid #e6eaf0",
              },
            }}
          >
            {/* HEADER */}
            <TableHead
              sx={{
                backgroundColor: "#f1f5f9",
              }}
            >
              <TableRow>
                <TableCell padding="checkbox" sx={checkboxCellSx}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 40,
                      pl: 0.5,
                    }}
                  >
                    <Checkbox
                      sx={checkboxSx}
                      checked={isAllSelected}
                      indeterminate={hasSelection && !isAllSelected}
                      onChange={(event) =>
                        toggleSelectAll(event.target.checked)
                      }
                      disabled={!allSelectableBlIds.length}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>House BL</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Shipper</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Consignee</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>

            {/* BODY */}
            <TableBody>
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box textAlign="center" py={4}>
                      <DescriptionIcon
                        sx={{ fontSize: 40, color: "#b0bec5" }}
                      />

                      <Typography color="text.secondary">
                        No HBL records available
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row) => {
                const lockMessage = getFilingLockMessage(row);
                const isBlIdInvalid =
                  !Number.isFinite(row.blId) || row.blId <= 0;

                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selectedBlIds.includes(row.blId)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f9fbff",
                      },
                    }}
                  >
                    <TableCell padding="checkbox" sx={checkboxCellSx}>
                      <Tooltip
                        title={lockMessage}
                        disableHoverListener={!lockMessage}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            minHeight: 40,
                            pl: 0.5,
                          }}
                        >
                          <Checkbox
                            sx={checkboxSx}
                            checked={selectedBlIds.includes(row.blId)}
                            onChange={() => toggleRowSelection(row.blId)}
                            disabled={isBlIdInvalid || Boolean(lockMessage)}
                          />
                        </Box>
                      </Tooltip>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 500 }}>{row.hblNo}</TableCell>

                    <TableCell>
                      {" "}
                      <TruncateText text={row.shipper} length={40} />
                    </TableCell>

                    <TableCell>
                      {" "}
                      <TruncateText text={row.consignee} length={40} />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #e6eaf0",
          justifyContent: "space-between",
        }}
      >
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={onPreviewAction}>
            Preview
          </Button>
          {isEnableEdiView && (
            <Button
              variant="outlined"
              onClick={handlePreviewRequest}
              disabled={!hasSelection || previewDownloading}
            >
              PREVIEW EDI REQUEST
            </Button>
          )}

          <Button
            variant="contained"
            onClick={() => onSubmitAction(selectedBlIds)}
            disabled={
              submitDisabled ||
              submitLoading ||
              !hasSelection ||
              hasSubmittedSelection ||
              hasAcceptedEmptyActionSelection
            }
            sx={{
              backgroundColor: themeDetails?.buttonColor || "#1a73e8",
              fontWeight: 600,
              px: 4,
              "&:hover": {
                backgroundColor: "#1558b0",
              },
            }}
          >
            Submit Filing
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitReviewDialog;
