import fs from "fs";

const file = "src/pages/DubaiMPCI/Components/HBLDetailsSection.jsx";
let text = fs.readFileSync(file, "utf8");

function cut(startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`markers missing ${startMarker} -> ${endMarker} (${start}, ${end})`);
  }
  text = text.slice(0, start) + text.slice(end);
}

cut("  const [linkModalOpen, setLinkModalOpen] = useState(false);", "  const [pdfExtractionModalOpen, setPdfExtractionModalOpen] = useState(false);");
cut("  const [excelFilingPartyMpciMismatches, setExcelFilingPartyMpciMismatches] =", "  useEffect(() => {\n    latestHblListRef.current = hblList;");
cut("  const handleAddHBL = useCallback(() => {", "  const handlePopulateFromPdf = useCallback(");
cut("  const handleOpenLinkModal = () => {", "  /* ---------------- Delete HBL ---------------- */");
cut("  // Parent BL Party MPCI ID and carrier code mismatch from Excel uplaod 2 start", "  return (");

text = text.replace(
  /<Box sx=\{\{ display: "flex", gap: 1 \}\}>[\s\S]*?<\/Box>/,
  `<Box sx={{ display: "flex", gap: 1 }}>
            {showPdfExtraction && (
              <ProgressButton
                label="Upload PDF/Image"
                onClick={() => setPdfExtractionModalOpen(true)}
                icon={<PictureAsPdfIcon style={{ marginRight: 6 }} />}
                autoWidth
                color="#fff"
              />
            )}
          </Box>`,
);

text = text.replace(
  /No HBLs added\. Use\{" "\}[\s\S]*?\./,
  'No HBLs added. Use "Upload PDF/Image".',
);

const dialogStart = text.indexOf("{/* Parent BL Party MPCI ID mismatch compare to Excel upload */}");
const pdfStart = text.indexOf("{showPdfExtraction && (");
if (dialogStart > 0 && pdfStart > dialogStart) {
  text = text.slice(0, dialogStart) + text.slice(pdfStart);
}

fs.writeFileSync(file, text);
console.log("hbl stripped");
