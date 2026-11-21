// preview/sections/ContainerDetailsPreview.jsx
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
import { formatContainerNumberValue } from "../../../utils/containerHeaderUtils";

const ContainerDetailsPreview = ({ containers = [], formatValue }) => {
  if (!containers.length) {
    return (
      <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
        No containers added
      </Typography>
    );
  }

  return (
    <Box>
      {containers.map((container, index) => (
        <Accordion
          className="preview-accordion preview-accordion--container"
          key={index}
          defaultExpanded={index === 0}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Container {index + 1}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Paper variant="outlined" sx={{ backgroundColor: "#fafafa" }}>
              <Box
                className="preview-grid"
                sx={{ p: 2, display:"grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
              >
                  <PreviewRow
                    label="Container Code"
                    value={container.containerCode}
                    fieldKey="containerCode"
                    formatValue={formatValue}
                  />
                  <PreviewRow
                    label="Container No"
                    value={formatContainerNumberValue(container.containerNo)}
                  />
                  <PreviewRow
                    label="Container Status"
                    value={container.containerStatus}
                    fieldKey="containerStatus"
                    formatValue={formatValue}
                  />

                  <PreviewRow label="Shipper Seal" value={container.shipperSeal} />
                  <PreviewRow
                    label="Shipper Seal Type"
                    value={container.shipperSealType}
                    fieldKey="shipperSealType"
                    formatValue={formatValue}
                  />
                  <PreviewRow label="Carrier Seal" value={container.carrierSeal} />
                  <PreviewRow
                    label="Carrier Seal Type"
                    value={container.carrierSealType}
                    fieldKey="carrierSealType"
                    formatValue={formatValue}
                  />
                  <PreviewRow label="Customs Seal" value={container.customsSeal} />
                  <PreviewRow
                    label="Customs Seal Type"
                    value={container.customsSealType}
                    fieldKey="customsSealType"
                    formatValue={formatValue}
                  />
                  <PreviewRow
                    label="Sealing Party Name"
                    value={container.sealingPartyName}
                  />

                  {/* <Divider sx={{ my: 1 }} /> */}

                  <PreviewRow
                    label="Package Type"
                    value={container.packageTypeName}
                    fieldKey="container.packageTypeName"
                    formatValue={formatValue}
                  />
                  <PreviewRow
                    label="Handling Instruction"
                    value={container.handlingInstructionName}
                    fieldKey="handlingInstructionName"
                    formatValue={formatValue}
                  />
                  <PreviewRow label="VGM Weight (KGM)" value={container.weight} />
                  <PreviewRow
                    label="No. of Packages"
                    value={container.numberOfPackages}
                  />
                  <PreviewRow
                    label="Split Filing"
                    value={container.removeContainerSplit}
                    fieldKey="removeContainerSplit"
                    formatValue={formatValue}
                  />

                  {container.removeContainerSplit === "Yes" && (
                    <>
                      {/* <Divider sx={{ my: 1 }} /> */}
                      <PreviewRow
                        label="New Split BL Number"
                        value={container.newSplitBlNumber}
                      />
                      <PreviewRow
                        label="New Parent BL Number"
                        value={container.newParentBlNumber}
                      />
                      <PreviewRow
                        label="New Vessel Name"
                        value={container.newVesselName}
                      />
                      <PreviewRow
                        label="New Voyage Number"
                        value={container.newVoyageNumber}
                      />
                    </>
                  )}

                  {/* <Divider sx={{ my: 1 }} /> */}

                  {container.reeferCargo && (
                    <>
                      <PreviewRow label="Reefer Cargo" value="Yes" />
                      <PreviewRow
                        label="Temperature (deg C)"
                        value={container.temperature}
                      />
                      <PreviewRow
                        label="Unit Code"
                        value={container.unitCode}
                        fieldKey="unitCode"
                        formatValue={formatValue}
                      />
                    </>
                  )}

                  {/* <Divider sx={{ my: 1 }} /> */}

                  {container.dangerousGoods && (
                    <PreviewRow label="Dangerous Goods" value="Yes" />
                  )}
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default ContainerDetailsPreview;
