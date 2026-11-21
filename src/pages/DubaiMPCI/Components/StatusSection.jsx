import React from "react";
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
} from "@/components/ui/mui";
import { RefreshRoundedIcon } from "@/components/ui/icons";
import LoadingComponent from "@/components/ui/LoadingComponent";

import { useSelector } from "react-redux";

const STATUS_STYLES = {
  submitted: { bg: "#FFF3E0", color: "#EF6C00" },
  accepted: { bg: "#E8F5E9", color: "#2E7D32" },
  rejected: { bg: "#FDECEA", color: "#D32F2F" },
  pending: { bg: "#E3F2FD", color: "#1976D2" },
};

const getStatusStyle = (status) => {
  const key = String(status || "").trim().toLowerCase();
  if (STATUS_STYLES[key]) return STATUS_STYLES[key];
  if (key.includes("pending")) return STATUS_STYLES.pending;
  if (key.includes("accept")) return STATUS_STYLES.accepted;
  if (key.includes("reject")) return STATUS_STYLES.rejected;
  if (key.includes("submit")) return STATUS_STYLES.submitted;
  return {};
};

const TABLE_HEADERS = [
  "#",
  "HBL No.",
  "Shipper",
  "Consignee",
  
  "Status",
  
  
];

const StatusSection = ({ onRefresh }) => {
  const { statusList = [], loading } = useSelector(
    (state) => state.DubaiFormFiling.status,
  );

  return (
    <Paper
      sx={{
        borderRadius: "14px",
        border: "1px solid #E6ECF3",
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Section Header */}
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
                onClick={onRefresh}
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

      {/* Table */}

      <TableContainer>
        <Table size="small">
          {/* Loading State */}
          {loading && <LoadingComponent />}
          {/* Table Head */}

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

          {/* Table Body */}

          <TableBody>
            {statusList.map((row, index) => {
              const statusStyle = getStatusStyle(row.status);

              return (
                <TableRow
                  key={row.hblNo || index}
                  sx={{
                    transition: "all .2s ease",
                    "&:nth-of-type(even)": {
                      background: "#FAFBFD",
                    },
                    "&:hover": {
                      background: "#F0F6FF",
                    },
                  }}
                >
                  {/* HBL */}
                   <TableCell>{index + 1}</TableCell>

                  <TableCell>{row.hblNo}</TableCell>

                  <TableCell>{row.shipper}</TableCell>

                  <TableCell>{row.consignee}</TableCell>

                  {/* <TableCell>{row.quantity}</TableCell> */}

                  {/* Status */}

                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>

                  {/* BL Match */}

                  {/* <TableCell>
                    <Chip
                      label={row.blMatched ? "Matched" : "Not Matched"}
                      size="small"
                      sx={{
                        background: row.blMatched ? "#E8F5E9" : "#FDECEA",
                        color: row.blMatched ? "#2E7D32" : "#D32F2F",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell> */}

                  {/* Hold */}

                  {/* <TableCell>
                    <Chip
                      label={row.hold ? "On Hold" : "Clear"}
                      size="small"
                      sx={{
                        background: row.hold ? "#FFF8E1" : "#E8F5E9",
                        color: row.hold ? "#F57C00" : "#2E7D32",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell> */}
                </TableRow>
              );
            })}

            {!loading && statusList.length === 0 && (
              <TableRow>
                <TableCell colSpan={TABLE_HEADERS.length} align="center">
                  <Typography
                    sx={{
                      py: 3,
                      color: "#8A94A6",
                    }}
                  >
                    No status data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default StatusSection;
