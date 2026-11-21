// preview/sections/PartiesPreview.jsx
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@/components/ui/mui";
import { ExpandMoreIcon } from "@/components/ui/icons";
import { useSelector } from "react-redux";
import PreviewRow from "../components/PreviewRow";

const PartiesPreview = ({ parties = [], formatValue }) => {
  const { themeDetails } = useSelector((state) => state.Theme);

  if (!parties.length) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
        No parties added
      </Typography>
    );
  }

  return (
    <Box>
      {parties.map((party, index) => (
        <Accordion
          className="preview-accordion preview-accordion--party"
          key={index}
          defaultExpanded={index === 0}
          sx={{
            backgroundColor: "#f5f5f5",
            "& .MuiAccordionSummary-root": {
              background:
                themeDetails?.AccordionSecondaryBackgroundColor || "#48d8dd",
              color: "#fff",
            },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Party : {party.partyType}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Paper variant="outlined" sx={{ backgroundColor: "#fafafa" }}>
             <Box
               className="preview-grid"
               sx={{ p: 2, display:"grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
             >
                  <PreviewRow label="Party Type" value={party.partyType} />
                  <PreviewRow label="Entity Name" value={party.partyName} />
                  <PreviewRow label="Address" value={party.address} />

                  <PreviewRow
                    label="City"
                    value={party.cityName}
                    fieldKey="cityName"
                    formatValue={formatValue}
                  />
                  <PreviewRow
                    label="State"
                    value={party.stateName}
                    fieldKey="state"
                    formatValue={formatValue}
                  />
                  <PreviewRow
                    label="Country"
                    value={party.countryName}
                    fieldKey="country"
                    formatValue={formatValue}
                  />

                  <PreviewRow label="PO Box No" value={party.poBox} />
                  <PreviewRow label="Tax ID" value={party.taxID} />

                  {party.partyType === "Consignee" && (
                    <>
                      {/* <Divider sx={{ my: 1 }} /> */}

                      <PreviewRow label="Qualifier" value={party.qualifier} />
                      <PreviewRow label="Identifier" value={party.identifierNo} />
                      <PreviewRow
                        label="Contact Party Type"
                        value={party.contactPartyType}
                        fieldKey="contactPartyType"
                        formatValue={formatValue}
                      />
                      <PreviewRow
                        label="Contact Name"
                        value={party.contactDetail}
                      />
                      <PreviewRow
                        label="Phone Number"
                        value={party.mobile}
                      />
                      <PreviewRow label="Email ID" value={party.email} />
                    </>
                  )}
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default PartiesPreview;
