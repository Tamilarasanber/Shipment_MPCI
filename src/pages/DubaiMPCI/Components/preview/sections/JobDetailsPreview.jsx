// preview/sections/JobDetailsPreview.jsx
import React from "react";
import { Paper, Box } from "@/components/ui/mui";
import PreviewRow from "../components/PreviewRow";

const defaultFormatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const JobDetailsPreview = ({ data, formatValue, formatDate = defaultFormatDate }) => {
  if (!data) return null;

  return (
    <Paper variant="outlined" sx={{ borderTop: 0 }}>
     <Box
       className="preview-grid"
       sx={{ p: 2, display:"grid", gridTemplateColumns: "1fr 1fr 1fr" }}
     >
          {/* ---- BASIC DETAILS ---- */}
          <PreviewRow
            label="Carrier"
            value={data.carrierName}
            fieldKey="carrierName"
            formatValue={formatValue}
          />

          <PreviewRow
            label="MBL Number"
            value={data.mblNo}
          />

          <PreviewRow
            label="Cargo Type"
            value={data.cargoType}
            fieldKey="cargoType"
            formatValue={formatValue}
          />

          {/* ---- DATES ---- */}
          <PreviewRow
            label="ETD Date"
            value={formatDate(data.etd)}
          />

          <PreviewRow
            label="ETA Date"
            value={formatDate(data.eta)}
          />

          {/* ---- PORT DETAILS ---- */}
          <PreviewRow
            label="First Port of Loading"
            value={data.firstPortLoadingName}
            fieldKey="firstPortLoadingName"
            formatValue={formatValue}
          />

          <PreviewRow
            label="Last Foreign Port"
            value={data.lastForeignPortName}
            fieldKey="lastForeignPortName"
            formatValue={formatValue}
          />

          <PreviewRow
            label="Port of Discharge"
            value={data.portOfDischargeName}
            fieldKey="portOfDischargeName"
            formatValue={formatValue}
          />

          {/* ---- VESSEL DETAILS ---- */}
          <PreviewRow
            label="Vessel Name"
            value={data.vesselName}
            fieldKey="vesselName"
            formatValue={formatValue}
          />

          <PreviewRow
            label="Voyage Number"
            value={data.voyageNo}
          />

          <PreviewRow
            label="Vessel Country"
            value={data.vesselCountryName}
            fieldKey="vesselCountryName"
            formatValue={formatValue}
          />

          {/* ---- MPCI IDS ---- */}
          <PreviewRow
            label="Filing Party MPCI ID"
            value={data.filingPartyMpciID}
          />

          {/* Optional */}
          {data.liablePartyMpciId && (
            <PreviewRow
              label="Liable UAE Party MPCI ID"
              value={data.liablePartyMpciId}
            />
          )}
      </Box>
    </Paper>
  );
};

export default JobDetailsPreview;
