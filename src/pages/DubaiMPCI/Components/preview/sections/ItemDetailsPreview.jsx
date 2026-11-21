// preview/sections/ItemDetailsPreview.jsx
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
import PreviewRow from "../components/PreviewRow";

const ItemDetailsPreview = ({ items = [], formatValue }) => {
  if (!items.length) {
    return (
      <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
        No items added
      </Typography>
    );
  }

  return (
    <Box>
      {items.map((item, index) => (
        <Accordion
          className="preview-accordion preview-accordion--item"
          key={index}
          defaultExpanded={index === 0}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Item {index + 1}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Paper variant="outlined" sx={{ backgroundColor: "#fafafa" }}>
              <Box
                className="preview-grid"
                sx={{ p: 2, display:"grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
              >
                  {/* --- Basic --- */}
                  <PreviewRow
                    label="HS Code"
                    value={item.hsCode}
                    fieldKey="hsCode"
                    formatValue={formatValue}
                  />

                  <PreviewRow
                    label="Container Number"
                    value={
                      Array.isArray(item.containerNo)
                        ? item.containerNo.join(", ")
                        : item.containerNo
                    }
                  />

                  <PreviewRow
                    label="No. of Packages"
                    value={item.numberOfPackages}
                  />

                  <PreviewRow
                    label="Package Type"
                    value={item.packageTypeName}
                    fieldKey="item.packageTypeName"
                    formatValue={formatValue}
                  />

                  <PreviewRow
                    label="Cargo Gross Weight (KGM)"
                    value={item.cargoGrossWeight}
                  />

                  <PreviewRow
                    label="Item Description"
                    value={item.itemDescription}
                  />

                  <PreviewRow
                    label="Marks & Numbers"
                    value={item.marksAndNumbers}
                  />

                  

                  {(item.imoClass || item.unCode) && (
                    <>
                      {/* <Divider sx={{ my: 1 }} /> */}
                      <PreviewRow
                        label="IMO Class"
                        value={item.imoClass}
                      />
                      <PreviewRow
                        label="UN Code"
                        value={item.unCode}
                      />
                    </>
                  )}

                  {/* <Divider sx={{ my: 1 }} /> */}

                  {/* --- Expanded --- */}
                  <PreviewRow
                    label="Marking Instructions"
                    value={item.markingInstructionName}
                    fieldKey="markingInstructionName"
                    formatValue={formatValue}
                  />

                  <PreviewRow
                    label="Packing Description Code"
                    value={item.packingRelatedDescCode}
                    fieldKey="packingRelatedDescCode"
                    formatValue={formatValue}
                  />

                  <PreviewRow
                    label="Cargo Net Weight (KGM)"
                    value={item.cargoNetWeight}
                  />

                  <PreviewRow
                    label="Volume (MTQ)"
                    value={item.volumeMtq}
                  />

                  <PreviewRow
                    label="Country of Origin"
                    value={item.countryOfOriginName}
                    fieldKey="countryOfOriginName"
                    formatValue={formatValue}
                  />
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default ItemDetailsPreview;
