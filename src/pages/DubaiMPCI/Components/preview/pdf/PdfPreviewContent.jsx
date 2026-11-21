import React from "react";
import { formatContainerNumberValue } from "../../../utils/containerHeaderUtils";

const GENERAL_SUMMARY_FIELDS = [
  { label: "Action", key: "actionCode", fieldKey: "actionCode" },
  { label: "Filing for", key: "filingfor", fieldKey: "filingfor" },
  { label: "Filing Type", key: "filingType", fieldKey: "filingType" },
  { label: "No. of HBLs", key: "noOfHBLs" },
];

const JOB_DETAILS_FIELDS = [
  { label: "Carrier", key: "carrierName", fieldKey: "carrierName" },
  { label: "MBL Number", key: "mblNo" },
  { label: "Cargo Type", key: "cargoType", fieldKey: "cargoType" },
  { label: "ETD Date", key: "etd", type: "date" },
  { label: "ETA Date", key: "eta", type: "date" },
  {
    label: "First Port of Loading",
    key: "firstPortLoadingName",
    fieldKey: "firstPortLoadingName",
  },
  {
    label: "Last Foreign Port",
    key: "lastForeignPortName",
    fieldKey: "lastForeignPortName",
  },
  {
    label: "Port of Discharge",
    key: "portOfDischargeName",
    fieldKey: "portOfDischargeName",
  },
  { label: "Vessel Name", key: "vesselName", fieldKey: "vesselName" },
  { label: "Voyage Number", key: "voyageNo" },
  {
    label: "Vessel Country",
    key: "vesselCountryName",
    fieldKey: "vesselCountryName",
  },
  // { label: "Filing Party MPCI ID", key: "filingPartyMpciID" },
  { label: "Liable UAE Party MPCI ID", key: "liablePartyMpciId" },
];

const GENERAL_INFO_FIELDS = [
  { label: "HBL No", key: "hblNo" },
  { label: "Parent BL Number", key: "parentBlNumber" },
  { label: "Parent BL Issuing Party Name", key: "parentBlIssuerPartyName" },
  { label: "Parent BL Party MPCI ID", key: "parentBlIssuerPartyMpciId" },
  // { label: "Filing Party MPCI ID", key: "filingPartyMpciID" },
  { label: "Liable UAE Party MPCI ID", key: "liablePartyMpciId" },
  {
    label: "Further Child BL?",
    key: "futureChildBl",
    fieldKey: "futureChildBl",
  },
  { label: "Movement Type", key: "movementType", fieldKey: "movementType" },
  { label: "BL Type", key: "blType", fieldKey: "blType" },
  {
    label: "Port Of Acceptance",
    key: "portOfAcceptance",
    fieldKey: "portOfAcceptance",
  },
  {
    label: "Port Of Transhipment",
    key: "portOfTranshipment",
    fieldKey: "portOfTranshipment",
  },
  {
    label: "End Destination",
    key: "endDestination",
    fieldKey: "endDestination",
  },
  { label: "Original BL Number", key: "originalNo" },
  { label: "Action", key: "actionCode", fieldKey: "actionCode" },
  {
    label: "Amendment Type",
    key: "amendmentType",
    fieldKey: "amendmentType",
  },
  { label: "Filing Remarks", key: "filingRemarks" },
  {
    label: "Attachments Count",
    key: "filingAttachments",
    getValue: (value) => (Array.isArray(value) ? value.length : value),
  },
  { label: "BL Date", key: "blDate", type: "date" },
  { label: "Emirate", key: "emirate", fieldKey: "emirate" },
  { label: "Cargo Type", key: "cargoType", fieldKey: "cargoType" },
  {
    label: "Place Of Bill Issue",
    key: "placeOfBillIssueName",
    fieldKey: "placeOfBillIssueName",
  },
  {
    label: "Place Of Freight Payment",
    key: "placeOfFreightPaymentName",
    fieldKey: "placeOfFreightPaymentName",
  },
  {
    label: "Freight Prepaid / Collect",
    key: "freightPaymentType",
    fieldKey: "freightPaymentType",
  },
  { label: "Invoice Amount", key: "invoiceAmount" },
  { label: "Currency", key: "currencyName", fieldKey: "currencyName" },
  {
    label: "Service Requirement",
    key: "serviceRequirement",
    fieldKey: "serviceRequirement",
  },
];

const PARTY_FIELDS = [
  { label: "Party Type", key: "partyType" },
  { label: "Entity Name", key: "partyName" },
  { label: "Address", key: "address" },
  { label: "City", key: "cityName", fieldKey: "cityName" },
  { label: "State", key: "stateName", fieldKey: "state" },
  { label: "Country", key: "countryName", fieldKey: "country" },
  { label: "PO Box No", key: "poBox" },
  { label: "Tax ID", key: "taxID" },
];

const CONSIGNEE_FIELDS = [
  { label: "Qualifier", key: "qualifier" },
  { label: "Identifier", key: "identifierNo" },
  {
    label: "Contact Party Type",
    key: "contactPartyType",
    fieldKey: "contactPartyType",
  },
  { label: "Contact Name", key: "contactDetail" },
  { label: "Phone Number", key: "mobile" },
  { label: "Email ID", key: "email" },
];

const CONTAINER_FIELDS = [
  { label: "Container Code", key: "containerCode", fieldKey: "containerCode" },
  {
    label: "Container No",
    key: "containerNo",
    getValue: (value) => formatContainerNumberValue(value),
  },
  {
    label: "Container Status",
    key: "containerStatus",
    fieldKey: "containerStatus",
  },
  { label: "Shipper Seal", key: "shipperSeal" },
  {
    label: "Shipper Seal Type",
    key: "shipperSealType",
    fieldKey: "shipperSealType",
  },
  { label: "Carrier Seal", key: "carrierSeal" },
  {
    label: "Carrier Seal Type",
    key: "carrierSealType",
    fieldKey: "carrierSealType",
  },
  { label: "Customs Seal", key: "customsSeal" },
  {
    label: "Customs Seal Type",
    key: "customsSealType",
    fieldKey: "customsSealType",
  },
  { label: "Sealing Party Name", key: "sealingPartyName" },
  {
    label: "Package Type",
    key: "packageTypeName",
    fieldKey: "container.packageTypeName",
  },
  {
    label: "Handling Instruction",
    key: "handlingInstructionName",
    fieldKey: "handlingInstructionName",
  },
  { label: "VGM Weight (KGM)", key: "weight" },
  { label: "No. of Packages", key: "numberOfPackages" },
  {
    label: "Split Filing",
    key: "removeContainerSplit",
    fieldKey: "removeContainerSplit",
  },
];

const CONTAINER_SPLIT_FIELDS = [
  { label: "New Split BL Number", key: "newSplitBlNumber" },
  { label: "New Parent BL Number", key: "newParentBlNumber" },
  { label: "New Vessel Name", key: "newVesselName" },
  { label: "New Voyage Number", key: "newVoyageNumber" },
];

const REEFER_FIELDS = [
  { label: "Reefer Cargo", key: "reeferCargo", getValue: () => "Yes" },
  { label: "Temperature (deg C)", key: "temperature" },
  { label: "Unit Code", key: "unitCode", fieldKey: "unitCode" },
];

const DANGEROUS_GOODS_FIELDS = [
  { label: "Dangerous Goods", key: "dangerousGoods", getValue: () => "Yes" },
];

const ITEM_FIELDS = [
  { label: "HS Code", key: "hsCode", fieldKey: "hsCode" },
  {
    label: "Container Number",
    key: "containerNo",
    getValue: (value) => (Array.isArray(value) ? value.join(", ") : value),
  },
  { label: "No. of Packages", key: "numberOfPackages" },
  {
    label: "Package Type",
    key: "packageTypeName",
    fieldKey: "item.packageTypeName",
  },
  { label: "Cargo Gross Weight (KGM)", key: "cargoGrossWeight" },
  { label: "Item Description", key: "itemDescription" },
  { label: "Marks & Numbers", key: "marksAndNumbers" },
  { label: "IMO Class", key: "imoClass" },
  { label: "UN Code", key: "unCode" },
  {
    label: "Marking Instructions",
    key: "markingInstructionName",
    fieldKey: "markingInstructionName",
  },
  {
    label: "Packing Description Code",
    key: "packingRelatedDescCode",
    fieldKey: "packingRelatedDescCode",
  },
  { label: "Cargo Net Weight (KGM)", key: "cargoNetWeight" },
  { label: "Volume (MTQ)", key: "volumeMtq" },
  {
    label: "Country of Origin",
    key: "countryOfOriginName",
    fieldKey: "countryOfOriginName",
  },
];

const hasDisplayValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const normalizedValue = value.trim();
    return normalizedValue !== "" && normalizedValue !== "-";
  }
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const PdfRow = ({ label, value }) => {
  if (!hasDisplayValue(value)) return null;

  return (
    <div className="pdf-row">
      <div className="pdf-row__label">{label}</div>
      <div className="pdf-row__value">{String(value)}</div>
    </div>
  );
};

const PdfRowList = ({ data, fields, formatValue, formatDate }) => (
  <div className="pdf-rows">
    {fields.map((field) => {
      const rawValue = field.getValue
        ? field.getValue(data?.[field.key], data)
        : data?.[field.key];

      const value =
        field.type === "date"
          ? formatDate(rawValue)
          : field.fieldKey
            ? formatValue(field.fieldKey, rawValue)
            : rawValue;

      if (!hasDisplayValue(value)) return null;

      return <PdfRow key={`${field.label}-${field.key}`} label={field.label} value={value} />;
    })}
  </div>
);

const PdfCard = ({ title, accentClass, children }) => (
  <section className="pdf-card">
    <div className={`pdf-card__title ${accentClass || ""}`.trim()}>{title}</div>
    <div className="pdf-card__body">{children}</div>
  </section>
);

const PdfPreviewContent = ({
  formData,
  hblList,
  selectedHblLabel,
  generatedOn,
  themeDetails,
  formatValue,
  formatDate,
}) => {
  const accentColor = themeDetails?.buttonColor || "#0f5c73";
  const hblGradient =
    themeDetails?.AccordionBackgroundColor ||
    "linear-gradient(90deg,#2E7DFF 0%, #00C6FF 100%)";
  const partyGradient =
    themeDetails?.AccordionSecondaryBackgroundColor ||
    "linear-gradient(90deg,#00BFA6 0%, #00C6FF 100%)";

  return (
    <div className="pdf-export-root">
      <style>
        {`
          .pdf-export-root {
            background: #eef3f8;
            padding: 18px;
            color: #18212b;
            font-family: Arial, Helvetica, sans-serif;
          }
          .pdf-report {
            background: #ffffff;
            border: 1px solid #d9e2ec;
            border-radius: 14px;
            overflow: hidden;
          }
          .pdf-header {
            padding: 22px 24px 18px;
            background: linear-gradient(135deg, ${accentColor} 0%, #163b65 100%);
            color: #ffffff;
          }
          .pdf-header__title {
            margin: 0 0 6px;
            font-size: 22px;
            font-weight: 700;
          }
          .pdf-header__subtitle {
            margin: 0;
            font-size: 12px;
            opacity: 0.92;
          }
          .pdf-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 14px 24px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          .pdf-chip {
            padding: 6px 10px;
            border-radius: 999px;
            background: #e8f1f8;
            color: #17324d;
            font-size: 11px;
            font-weight: 700;
          }
          .pdf-content {
            padding: 20px 24px 24px;
          }
          .pdf-section {
            margin-bottom: 18px;
            break-inside: auto;
            page-break-inside: auto;
          }
          .pdf-section:last-child {
            margin-bottom: 0;
          }
          .pdf-section__heading {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 700;
            color: #17324d;
            break-after: avoid-page;
            page-break-after: avoid;
          }
          .pdf-card {
            margin-bottom: 12px;
            border: 1px solid #dbe5ef;
            border-radius: 12px;
            overflow: hidden;
            background: #ffffff;
            break-inside: auto;
            page-break-inside: auto;
          }
          .pdf-card:last-child {
            margin-bottom: 0;
          }
          .pdf-card__title {
            padding: 10px 14px;
            background: #f8fafc;
            color: #17324d;
            font-size: 13px;
            font-weight: 700;
            border-bottom: 1px solid #e2e8f0;
            break-after: avoid-page;
            page-break-after: avoid;
          }
          .pdf-card__title--hbl {
            background: ${hblGradient};
            color: #ffffff;
          }
          .pdf-card__title--party {
            background: ${partyGradient};
            color: #ffffff;
          }
          .pdf-card__title--soft {
            background: linear-gradient(90deg, rgba(30, 136, 229, 0.14) 0%, rgba(0, 198, 255, 0.08) 100%);
          }
          .pdf-card__body {
            padding: 12px 14px;
          }
          .pdf-rows {
            display: block;
          }
          .pdf-row {
            display: grid;
            grid-template-columns: minmax(170px, 220px) minmax(0, 1fr);
            gap: 8px 16px;
            align-items: start;
            padding: 7px 0;
            border-bottom: 1px solid #edf2f7;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .pdf-row:last-child {
            border-bottom: none;
          }
          .pdf-row__label {
            font-size: 11px;
            font-weight: 700;
            color: #526277;
          }
          .pdf-row__value {
            font-size: 12px;
            color: #18212b;
            word-break: break-word;
            white-space: normal;
            line-height: 1.5;
          }
          .pdf-empty {
            color: #64748b;
            font-size: 12px;
            text-align: center;
            padding: 14px 0;
          }
          @media print {
            @page { size: A4; margin: 12mm; }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .pdf-export-root {
              padding: 0;
              background: #ffffff;
            }
            .pdf-report {
              border: none;
              border-radius: 0;
            }
          }
        `}
      </style>

      <div className="pdf-report">
        <header className="pdf-header">
          <h1 className="pdf-header__title">MPCI Filing Preview</h1>
          <p className="pdf-header__subtitle">
            Clean export layout for review, download, and sharing
          </p>
        </header>

        <div className="pdf-meta">
          <span className="pdf-chip">HBL Scope: {selectedHblLabel}</span>
          <span className="pdf-chip">Generated On: {generatedOn}</span>
        </div>

        <div className="pdf-content">
          <section className="pdf-section">
            <h2 className="pdf-section__heading">General Info</h2>
            <PdfCard>
              <PdfRowList
                data={formData}
                fields={GENERAL_SUMMARY_FIELDS}
                formatValue={formatValue}
                formatDate={formatDate}
              />
            </PdfCard>
          </section>

          <section className="pdf-section">
            <h2 className="pdf-section__heading">Job Details</h2>
            <PdfCard>
              <PdfRowList
                data={formData}
                fields={JOB_DETAILS_FIELDS}
                formatValue={formatValue}
                formatDate={formatDate}
              />
            </PdfCard>
          </section>

          <section className="pdf-section">
            <h2 className="pdf-section__heading">HBL List ({hblList.length})</h2>
            {!hblList.length ? (
              <div className="pdf-empty">No HBL records added</div>
            ) : (
              hblList.map((hbl, index) => (
                <PdfCard
                  key={hbl.id || index}
                  title={`HBL No : ${hbl?.generalInfo?.hblNo || "-"}`}
                  accentClass="pdf-card__title--hbl"
                >
                  <div className="pdf-section">
                    <h3 className="pdf-section__heading">General Information</h3>
                    <PdfCard>
                      <PdfRowList
                        data={hbl.generalInfo || {}}
                        fields={GENERAL_INFO_FIELDS}
                        formatValue={formatValue}
                        formatDate={formatDate}
                      />
                    </PdfCard>
                  </div>

                  <div className="pdf-section">
                    <h3 className="pdf-section__heading">Party Details</h3>
                    {!hbl?.parties?.length ? (
                      <div className="pdf-empty">No parties added</div>
                    ) : (
                      hbl.parties.map((party, partyIndex) => (
                        <PdfCard
                          key={`${party.partyType || "party"}-${partyIndex}`}
                          title={`Party : ${party.partyType || partyIndex + 1}`}
                          accentClass="pdf-card__title--party"
                        >
                          <PdfRowList
                            data={party}
                            fields={[
                              ...PARTY_FIELDS,
                              ...(party.partyType === "Consignee"
                                ? CONSIGNEE_FIELDS
                                : []),
                            ]}
                            formatValue={formatValue}
                            formatDate={formatDate}
                          />
                        </PdfCard>
                      ))
                    )}
                  </div>

                  <div className="pdf-section">
                    <h3 className="pdf-section__heading">Container Details</h3>
                    {!hbl?.containers?.length ? (
                      <div className="pdf-empty">No containers added</div>
                    ) : (
                      hbl.containers.map((container, containerIndex) => (
                        <PdfCard
                          key={`container-${containerIndex}`}
                          title={`Container ${containerIndex + 1}`}
                          accentClass="pdf-card__title--soft"
                        >
                          <PdfRowList
                            data={container}
                            fields={[
                              ...CONTAINER_FIELDS,
                              ...(container.removeContainerSplit === "Yes"
                                ? CONTAINER_SPLIT_FIELDS
                                : []),
                              ...(container.reeferCargo ? REEFER_FIELDS : []),
                              ...(container.dangerousGoods
                                ? DANGEROUS_GOODS_FIELDS
                                : []),
                            ]}
                            formatValue={formatValue}
                            formatDate={formatDate}
                          />
                        </PdfCard>
                      ))
                    )}
                  </div>

                  <div className="pdf-section">
                    <h3 className="pdf-section__heading">Item Details</h3>
                    {!hbl?.items?.length ? (
                      <div className="pdf-empty">No items added</div>
                    ) : (
                      hbl.items.map((item, itemIndex) => (
                        <PdfCard
                          key={`item-${itemIndex}`}
                          title={`Item ${itemIndex + 1}`}
                          accentClass="pdf-card__title--soft"
                        >
                          <PdfRowList
                            data={item}
                            fields={ITEM_FIELDS}
                            formatValue={formatValue}
                            formatDate={formatDate}
                          />
                        </PdfCard>
                      ))
                    )}
                  </div>
                </PdfCard>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewContent;
