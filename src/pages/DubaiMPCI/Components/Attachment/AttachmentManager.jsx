import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from "@/components/ui/mui";
import { CheckCircleIcon } from "@/components/ui/icons";
import ConfirmDeletePopover from "@/components/ui/ConfirmDeletePopover";
import { validateAttachment } from "../../utils/attachmentValidation";

/* ---------- helpers ---------- */
const createRow = (sno) => ({
  sno,
  documentType: "",
  referenceNo: "",
  file: null,
  protectedOrUnprotected: "Unprotected",
});

const isRowComplete = (row) =>
  Boolean(row && row.documentType && row.referenceNo && row.file);

//  requiredFields: { documentType, referenceNo, file, protectedOrUnprotected }
const renderLabel = (label, required) => (
  <>
    {label}
    {required ? (
      <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>
    ) : (
      <span style={{ color: "#64748B", marginLeft: 6, fontSize: 12 }}>
        (Optional)
      </span>
    )}
  </>
);

/* ---------- component ---------- */
const AttachmentTableManager = ({
  value = [],
  onChange,
  onDeleteRow,
  requiredFields = {
    documentType: true,
    referenceNo: true,
    file: true,
    protectedOrUnprotected: false,
  },
}) => {
  const [dragIndex, setDragIndex] = useState(null);

  const rows = value || [];
  const lastRow = rows.length ? rows[rows.length - 1] : null;
  const canAdd = rows.length === 0 || isRowComplete(lastRow);

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([...rows, createRow(rows.length + 1)]);
  };

  const handleRemove = (index) => {
    const row = rows[index];
    if (typeof onDeleteRow === "function") {
      const shouldRemove = onDeleteRow(row, index);
      if (shouldRemove === false) return;
    }

    const updated = rows.filter((_, i) => i !== index);
    onChange(updated.map((item, rowIndex) => ({ ...item, sno: rowIndex + 1 })));
  };

  const handleChange = (index, key, val) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleFileSelect = (index, file) => {
    const error = validateAttachment(file);

    if (error) {
      alert(error); // or snackbar
      return;
    }

    handleChange(index, "file", file);
  };

  return (
    <Box>
      {!rows.length && (
        <Box
          sx={{
            border: "1px dashed #CBD5E1",
            borderRadius: 1,
            p: 3,
            mb: 2,
            textAlign: "center",
            backgroundColor: "#F8FAFC",
          }}
        >
          <Typography sx={{ color: "#64748B", fontSize: 14 }}>
            No attachment added
          </Typography>
          <Button size="small" onClick={handleAdd} sx={{ mt: 1.5 }}>
            + Add Attachment
          </Button>
        </Box>
      )}

      {rows.map((row, index) => (
        <Box
          key={row.id || row.sno}
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 1,
            p: 2,
            mb: 2,
          }}
        >
          {/* S.No */}
          <Typography fontWeight={600}>S.No {row.sno}</Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                size="small"
                label={renderLabel("Document Type", requiredFields.documentType)}
                value={row.documentType}
                onChange={(e) =>
                  handleChange(index, "documentType", e.target.value)
                }
                fullWidth
              />
            </Grid>

             {/* Reference No */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                size="small"
                label={renderLabel("Reference No", requiredFields.referenceNo)}
                value={row.referenceNo}
                onChange={(e) =>
                  handleChange(index, "referenceNo", e.target.value)
                }
                fullWidth
              />
            </Grid>

             {/* File Upload */}
            <Grid size={{ xs: 12, md: 2 }} sx={{ mt: "27px" }}>
              <Box
                component="div"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragIndex(index);
                }}
                onDragLeave={() => setDragIndex(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragIndex(null);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    handleFileSelect(index, file);
                  }
                }}
                sx={{
                  border: "2px dashed",
                  borderColor: row.file
                    ? "success.main"
                    : dragIndex === index
                      ? "primary.main"
                      : "#CBD5E1",
                  borderRadius: 1,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  bgcolor: row.file
                    ? "rgba(46, 125, 50, 0.05)"
                    : dragIndex === index
                      ? "rgba(25, 118, 210, 0.05)"
                      : "transparent",
                  transition: "all 0.2s ease",
                }}
                onClick={() =>
                  document.getElementById(`file-input-${index}`)?.click()
                }
              >
                <Typography
                  fontSize={13}
                  sx={{ mr: 1, flex: 1, textAlign: "left" }}
                >
                  {row.file ? (
                    row.file.name
                  ) : (
                    <>
                      Drag & Drop / Browse
                      {requiredFields.file ? (
                        <span style={{ color: "#d32f2f" }}> *</span>
                      ) : (
                        <span
                          style={{
                            color: "#64748B",
                            marginLeft: 4,
                            fontSize: 12,
                          }}
                        >
                          (Optional)
                        </span>
                      )}
                    </>
                  )}
                </Typography>

                {row.file && (
                  <CheckCircleIcon
                    fontSize="small"
                    sx={{ color: "success.main" }}
                  />
                )}

                <input
                  id={`file-input-${index}`}
                  hidden
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(index, file);
                    }
                  }}
                />
              </Box>

               {/* ✅ Supported formats BELOW like error */}
              {!row.file && (
                <Typography
                  fontSize={12}
                  sx={{
                    color: "#d32f2f",
                    mt: 0.5,
                    ml: 0.25,
                    textAlign: "left",
                  }}
                >
                  Formats: jpeg, jpg, png, pdf
                </Typography>
              )}
            </Grid>

            {/* Is Protected */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ToggleButtonGroup
                size="small"
                fullWidth
                value={row.protectedOrUnprotected}
                exclusive
                onChange={(_, val) =>
                  val && handleChange(index, "protectedOrUnprotected", val)
                }
              >
                <ToggleButton value="Unprotected">Unprotected</ToggleButton>
                <ToggleButton value="Protected">Protected</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Delete */}
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <ConfirmDeletePopover
                title="Delete Attachment"
                message={`Are you sure you want to delete attachment ${row.sno}?`}
                onConfirm={() => handleRemove(index)}
              />
            </Grid>
          </Grid>
        </Box>
      ))}
         {/* Add Attachment – always visible */}
      {rows.length > 0 && (
        <Button size="small" onClick={handleAdd} disabled={!canAdd}>
          + Add Attachment
        </Button>
      )}
    </Box>
  );
};

export default AttachmentTableManager;
