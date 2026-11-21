import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@/components/ui/mui";
import { CloseIcon } from "@/components/ui/icons";
import { CheckCircleIcon } from "@/components/ui/icons";
import { ExpandMoreIcon } from "@/components/ui/icons";
import { useSelector } from "react-redux";
import { usePreviewFormatter } from "./hooks/usePreviewFormatter";
import PreviewRow from "./components/PreviewRow";
import GeneralInfoPreview from "./sections/GeneralInfoPreview";
import JobDetailsPreview from "./sections/JobDetailsPreview";
import PartyDetailsPreview from "./sections/PartyDetailsPreview";
import ContainerDetailsPreview from "./sections/ContainerDetailsPreview";
import ItemDetailsPreview from "./sections/ItemDetailsPreview";
import PdfPreviewContent from "./pdf/PdfPreviewContent";

const SectionTitle = ({ title, themeDetails }) => (
  <Box
    sx={{
      backgroundColor: themeDetails?.buttonColor,
      color: "#fff",
      px: 2,
      py: 1,
      borderRadius: "4px 4px 0 0",
    }}
  >
    <Typography fontWeight={600}>{title}</Typography>
  </Box>
);

const PreviewModal = ({ open, onClose, formData }) => {
  const { themeDetails } = useSelector((state) => state.Theme);
  const { formatValue, formatDate } = usePreviewFormatter();
  const [selectedHblIndex, setSelectedHblIndex] = useState("ALL");
  const pdfPrintRef = useRef(null);

  const hblList = formData?.hblList || [];

  useEffect(() => {
    if (!open) return;
    setSelectedHblIndex("ALL");
  }, [open, formData]);

  const filteredHblList = useMemo(() => {
    if (selectedHblIndex === "ALL") return hblList;
    const index = Number(selectedHblIndex);
    if (Number.isNaN(index) || !hblList[index]) return [];
    return [hblList[index]];
  }, [hblList, selectedHblIndex]);

  const selectedHblLabel = useMemo(
    () =>
      selectedHblIndex === "ALL"
        ? "all-hbl"
        : hblList[Number(selectedHblIndex)]?.generalInfo?.hblNo || "hbl",
    [hblList, selectedHblIndex],
  );

  const generatedOn = useMemo(
    () =>
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  const handleDownloadPdf = () => {
    if (!pdfPrintRef.current) return;

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;

    const printableHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>MPCI-Preview-${selectedHblLabel}</title>
        </head>
        <body>
          ${pdfPrintRef.current.outerHTML}
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          width: "90%",
          maxWidth: "90%",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography variant="h6">Preview - MPCI Filing</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box
          className="no-print"
          sx={{ my: 2, display: "flex", justifyContent: "flex-end" }}
        >
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="preview-hbl-select-label">HBL For PDF</InputLabel>
            <Select
              labelId="preview-hbl-select-label"
              value={selectedHblIndex}
              label="HBL For PDF"
              onChange={(e) => setSelectedHblIndex(e.target.value)}
            >
              <MenuItem value="ALL">All HBLs</MenuItem>
              {hblList.map((hbl, index) => (
                <MenuItem key={hbl.id || index} value={String(index)}>
                  {hbl?.generalInfo?.hblNo || `HBL ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <SectionTitle title="General Info" themeDetails={themeDetails} />
            <Paper variant="outlined" sx={{ borderTop: 0 }}>
              <Box
                sx={{
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr 1fr" },
                }}
              >
                <PreviewRow
                  label="Action"
                  value={formData.actionCode}
                  fieldKey="actionCode"
                  formatValue={formatValue}
                />
                <PreviewRow
                  label="Filing for"
                  value={formData.filingfor}
                  fieldKey="filingfor"
                  formatValue={formatValue}
                />
                <PreviewRow
                  label="Filing Type"
                  value={formData.filingType}
                  fieldKey="filingType"
                  formatValue={formatValue}
                />
                <PreviewRow label="No. of HBLs" value={formData.noOfHBLs} />
              </Box>
            </Paper>
          </Box>

          <Box>
            <SectionTitle title="Job Details" themeDetails={themeDetails} />
            <Paper variant="outlined" sx={{ borderTop: 0 }}>
              <JobDetailsPreview
                data={formData}
                formatValue={formatValue}
                formatDate={formatDate}
              />
            </Paper>
          </Box>

          <Box>
            <SectionTitle
              title={`HBL List (${filteredHblList.length})`}
              themeDetails={themeDetails}
            />
            <Paper variant="outlined" sx={{ borderTop: 0, p: 1 }}>
              {!filteredHblList.length ? (
                <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                  No HBL records added
                </Typography>
              ) : (
                filteredHblList.map((hbl, index) => (
                  <Accordion
                    key={hbl.id || index}
                    defaultExpanded
                    sx={{
                      backgroundColor: "#f5f5f5",
                      "& .MuiAccordionSummary-root": {
                        background:
                          themeDetails?.AccordionBackgroundColor || "#0cc2f0",
                        color: "#fff",
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        HBL No : {hbl?.generalInfo?.hblNo || "-"}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography fontWeight={600} mb={1}>
                        General Information
                      </Typography>
                      <GeneralInfoPreview
                        generalInfo={hbl.generalInfo}
                        formatValue={formatValue}
                      />

                      <Typography fontWeight={600} mt={2} mb={1}>
                        Party Details
                      </Typography>
                      <PartyDetailsPreview
                        parties={hbl.parties}
                        formatValue={formatValue}
                      />

                      <Typography fontWeight={600} mt={2} mb={1}>
                        Container Details
                      </Typography>
                      <ContainerDetailsPreview
                        containers={hbl.containers}
                        formatValue={formatValue}
                      />

                      <Typography fontWeight={600} mt={2} mb={1}>
                        Item Details
                      </Typography>
                      <ItemDetailsPreview
                        items={hbl.items}
                        formatValue={formatValue}
                      />
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Paper>
          </Box>
        </Box>

        <Box
          sx={{
            position: "absolute",
            left: "-99999px",
            top: 0,
            width: "210mm",
            pointerEvents: "none",
            opacity: 0,
          }}
        >
          <div ref={pdfPrintRef}>
            <PdfPreviewContent
              formData={formData}
              hblList={filteredHblList}
              selectedHblLabel={selectedHblLabel}
              generatedOn={generatedOn}
              themeDetails={themeDetails}
              formatValue={formatValue}
              formatDate={formatDate}
            />
          </div>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: "#f5f5f5", gap: 1 }}>
        <Button variant="outlined" onClick={handleDownloadPdf}>
          Download PDF
        </Button>
        <Button variant="contained" onClick={onClose}>
          Close Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewModal;
