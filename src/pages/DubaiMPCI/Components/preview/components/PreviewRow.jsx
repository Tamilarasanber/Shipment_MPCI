// preview/components/PreviewRow.jsx
import React from "react";
import { Box, Typography } from "@/components/ui/mui";

const PreviewRow = ({ label, value, fieldKey, formatValue }) => {
  const hasRawValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    !(Array.isArray(value) && value.length === 0);

  const displayValue =
    formatValue && fieldKey
      ? formatValue(fieldKey, value)
      : hasRawValue
        ? value
        : "-";

  const isEmptyDisplay =
    displayValue === "-" ||
    displayValue === "" ||
    displayValue === null ||
    displayValue === undefined ||
    (Array.isArray(displayValue) && displayValue.length === 0);

  if (isEmptyDisplay) return null;

  return (
    <Box
      className="preview-row"
      sx={{
        display: "grid",
        // gridTemplateColumns: { xs: "1fr", sm: "minmax(180px, 32%) 1fr" },
        gap: 1,
        py: 1,
        borderBottom: "1px solid #f0f0f0",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Typography sx={{ fontWeight: 600, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        sx={{
          color: "text.primary",
          wordBreak: "break-word",
          whiteSpace: "normal",
          lineHeight: 1.5,
        }}
      >
        {displayValue}
      </Typography>
    </Box>
  );
};

export default PreviewRow;
