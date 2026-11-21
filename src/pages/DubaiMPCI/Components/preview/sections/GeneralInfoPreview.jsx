// preview/sections/GeneralInfoPreview.jsx
import React from "react";
import { Paper, Box, Typography, Divider } from "@/components/ui/mui";
import PreviewRow from "../components/PreviewRow";

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const GeneralInfoPreview = ({ generalInfo = {}, formatValue }) => {
  if (!generalInfo) return null;

  return (
    <Paper variant="outlined" sx={{ borderTop: 0 }}>
      <Box
        className="preview-grid"
        sx={{ p: 2, display:"grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
      >
          {/* ---- BASIC ---- */}
          <PreviewRow label="HBL No" value={generalInfo.hblNo} />
          
          <PreviewRow
            label="Parent BL Number"
            value={generalInfo.parentBlNumber}
          />
          <PreviewRow
            label="Parent BL Issuing Party Name"
            value={generalInfo.parentBlIssuerPartyName}
          />
          <PreviewRow
            label="Parent BL Party MPCI ID"
            value={generalInfo.parentBlIssuerPartyMpciId}
          />
          <PreviewRow
            label="Filing Party MPCI ID"
            value={generalInfo.filingPartyMpciID}
          />
          <PreviewRow
            label="Liable UAE Party MPCI ID"
            value={generalInfo.liablePartyMpciId}
          />
          <PreviewRow
            label="Further Child BL?"
            value={generalInfo.futureChildBl}
            fieldKey="futureChildBl"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Movement Type"
            value={generalInfo.movementType}
            fieldKey="movementType"
            formatValue={formatValue}
          />
          <PreviewRow
            label="BL Type"
            value={generalInfo.blType}
            fieldKey="blType"
            formatValue={formatValue}
          />

          {/* ---- PORTS ---- */}
          <PreviewRow
            label="Port Of Acceptance"
            value={generalInfo.portOfAcceptance}
            fieldKey="portOfAcceptance"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Port Of Transhipment"
            value={generalInfo.portOfTranshipment}
            fieldKey="portOfTranshipment"
            formatValue={formatValue}
          />
          <PreviewRow
            label="End Destination"
            value={generalInfo.endDestination}
            fieldKey="endDestination"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Original BL Number"
            value={generalInfo.originalNo}
            fieldKey="originalNo"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Action"
            value={generalInfo.actionCode}
            fieldKey="actionCode"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Amendment Type"
            value={generalInfo.amendmentType}
            fieldKey="amendmentType"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Filing Remarks"
            value={generalInfo.filingRemarks}
          />
          <PreviewRow
            label="Attachments Count"
            value={
              Array.isArray(generalInfo.filingAttachments)
                ? generalInfo.filingAttachments.length || ""
                : ""
            }
          />

          {/* <Divider sx={{ my: 1 }} /> */}

          {/* ---- EXPANDED ---- */}
          <PreviewRow
            label="BL Date"
            value={formatDate(generalInfo.blDate)}
          />
          <PreviewRow
            label="Emirate"
            value={generalInfo.emirate}
            fieldKey="emirate"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Cargo Type"
            value={generalInfo.cargoType}
            fieldKey="cargoType"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Place Of Bill Issue"
            value={generalInfo.placeOfBillIssueName}
            fieldKey="placeOfBillIssueName"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Place Of Freight Payment"
            value={generalInfo.placeOfFreightPaymentName}
            fieldKey="placeOfFreightPaymentName"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Freight Prepaid / Collect"
            value={generalInfo.freightPaymentType}
            fieldKey="freightPaymentType"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Invoice Amount"
            value={generalInfo.invoiceAmount}
          />
          <PreviewRow
            label="Currency"
            value={generalInfo.currencyName}
            fieldKey="currencyName"
            formatValue={formatValue}
          />
          <PreviewRow
            label="Service Requirement"
            value={generalInfo.serviceRequirement}
            fieldKey="serviceRequirement"
            formatValue={formatValue}
          />
      </Box>
    </Paper>
  );
};

export default GeneralInfoPreview;
