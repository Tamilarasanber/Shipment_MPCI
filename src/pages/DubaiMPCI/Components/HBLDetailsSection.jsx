import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { connect } from "formik";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from "@/components/ui/mui";
import { AddIcon, PictureAsPdfIcon } from "@/components/ui/icons";
import { useSelector } from "react-redux";
import { initialHBLValue } from "../InitialValues/initialHBLValue";
import HBLAccordionItem from "./HBLAccordionItem";
import PdfExtractionModal from "./pdfExtraction/PdfExtractionModal";
import ProgressButton from "@/components/ui/ProgressButton";
import { buildContainerHeadersFromHbls } from "../MapperLayer/mapReviewedPdfToHBL";
import { hydrateNewHblWithContainerHeader } from "../hooks/useContainerHeaderAutofill";
import { canUsePdfExtraction } from "../utils/canUsePdfExtraction";

const createClientHblId = () => crypto.randomUUID();

const ensureClientHblId = (hbl = {}) =>
  hbl?.clientId
    ? hbl
    : {
        ...hbl,
        clientId: createClientHblId(),
      };

const getHblIdentity = (hbl = {}) => {
  if (hbl?.clientId) {
    return `client:${hbl.clientId}`;
  }

  if (hbl?.linkedShipmentId) {
    return `shipment:${hbl.linkedShipmentId}`;
  }

  if (hbl?.id !== undefined && hbl?.id !== null && hbl?.id !== "") {
    return `persisted:${hbl.id}`;
  }

  return `fallback:${createClientHblId()}`;
};

const mergeUniqueHbls = (currentList = [], incomingList = []) => {
  const normalizedCurrent = currentList.map(ensureClientHblId);
  const seen = new Set(normalizedCurrent.map(getHblIdentity));
  const merged = [...normalizedCurrent];

  incomingList.map(ensureClientHblId).forEach((hbl) => {
    const identity = getHblIdentity(hbl);
    if (seen.has(identity)) return;

    seen.add(identity);
    merged.push(hbl);
  });

  return merged;
};
// Run time error code in auto fill hbl shipment
const buildTouchedTree = (value) => {
  if (Array.isArray(value)) {
    return value.map(buildTouchedTree);
  }

  if (value && typeof value === "object") {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = buildTouchedTree(value[key]);
      return acc;
    }, {});
  }

  return true;
};

const mergeTouchedTree = (baseTouched, path, value) => {
  const nextTouched = Array.isArray(baseTouched)
    ? [...baseTouched]
    : { ...(baseTouched || {}) };

  nextTouched[path] = buildTouchedTree(value);
  return nextTouched;
};

// Container Header auto fill when excel upload container details and exsting container start
const hasContainerHeaderValue = (header = {}) =>
  Object.entries(header).some(([key, value]) => {
    if (key === "id") return false;
    if (typeof value === "boolean") return value;
    return String(value ?? "").trim() !== "";
  });

const mergeExcelContainerHeaders = (existingHeaders, excelHeaders) => {
  if (!excelHeaders.length) return existingHeaders;

  const existingContainerNos = new Set(
    existingHeaders
      .filter(hasContainerHeaderValue)
      .map((header) => String(header?.containerNoHeader ?? "").trim())
      .filter(Boolean),
  );
  const pendingExcelHeaders = excelHeaders.filter((header) => {
    const containerNo = String(header?.containerNoHeader ?? "").trim();
    return !containerNo || !existingContainerNos.has(containerNo);
  });
  let excelHeaderIndex = 0;

  const mergedHeaders = existingHeaders.map((header) => {
    if (hasContainerHeaderValue(header)) return header;

    const excelHeader = pendingExcelHeaders[excelHeaderIndex];
    excelHeaderIndex += 1;
    return excelHeader || header;
  });

  return [...mergedHeaders, ...pendingExcelHeaders.slice(excelHeaderIndex)];
};
// Container Header auto fill when excel upload container details and exsting container end
// // Parent BL Party MPCI ID and carrier code mismatch from Excel uplaod start
const getExcelFilingPartyMpciMismatches = (shipments, carrierMpciCode) => {
  const carrierCode = String(carrierMpciCode ?? "").trim();
  if (!carrierCode) return [];

  return shipments.reduce((mismatches, shipment, index) => {
    const filingPartyMpciId = String(
      shipment?.filingPartyMpciId ?? shipment?.filingPartyMpciID ?? "",
    ).trim();

    if (!filingPartyMpciId || filingPartyMpciId === carrierCode) {
      return mismatches;
    }

    mismatches.push({
      hblNo: shipment?.hblNo || `HBL ${index + 1}`,
      filingPartyMpciId,
      uniqueId: String(shipment?.uniqueId ?? "").trim(),
    });
    return mismatches;
  }, []);
};
// Parent BL Party MPCI ID and carrier code mismatch from Excel uplaod end
const HBLDetailsSection = ({ formik }) => {
  const { loginUserData } = useSelector((state) => state.Login);
  const showPdfExtraction = canUsePdfExtraction(loginUserData);
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setValues,
    setTouched,
    validateForm,
  } = formik;
  const hblList = values.hblList || [];
  const agentCode = String(values.efsAgentCodeField ?? "").trim();
  const containerHeaders = Array.isArray(values.containerHeaders)
    ? values.containerHeaders
    : [];
  const latestHblListRef = useRef(hblList);
  // Tracks only values seeded by the carrier. This lets a later carrier change
  // update auto-filled values without overwriting a value entered by the user.
  const autoFilledParentIssuerByHblRef = useRef(new Map());

  const [expandedHBL, setExpandedHBL] = useState(null);
  const [pdfExtractionModalOpen, setPdfExtractionModalOpen] = useState(false);
  const [addingHBL, setAddingHBL] = useState(false);
  useEffect(() => {
    latestHblListRef.current = hblList;
  }, [hblList]);

  useEffect(() => {
    if (!hblList.length) return;

    const hasMissingClientId = hblList.some((hbl) => !hbl?.clientId);
    if (!hasMissingClientId) return;

    setFieldValue("hblList", hblList.map(ensureClientHblId), false);
  }, [hblList, setFieldValue]);

  // This must live above the accordion items: collapsed accordion content is
  // unmounted, so a field-level effect cannot populate every HBL from a carrier
  // selected after PDF/Excel HBLs are added.
  useEffect(() => {
    const carrierMpciCode = String(values.carrierMpciCode ?? "").trim();
    if (!carrierMpciCode || !hblList.length) return;

    const activeHblIds = new Set();
    let hasChanges = false;

    const nextHblList = hblList.map((hbl, index) => {
      const hblId = hbl?.clientId ?? hbl?.linkedShipmentId ?? `index:${index}`;
      activeHblIds.add(hblId);

      const currentValue = String(
        hbl?.generalInfo?.parentBlIssuerPartyMpciId ?? "",
      ).trim();
      const previouslyAutoFilled =
        autoFilledParentIssuerByHblRef.current.get(hblId);
      const canUseCarrierValue =
        (!currentValue && !previouslyAutoFilled) ||
        currentValue === previouslyAutoFilled;

      if (!canUseCarrierValue) return hbl;

      if (currentValue === carrierMpciCode) {
        autoFilledParentIssuerByHblRef.current.set(hblId, carrierMpciCode);
        return hbl;
      }

      hasChanges = true;
      autoFilledParentIssuerByHblRef.current.set(hblId, carrierMpciCode);
      return {
        ...hbl,
        generalInfo: {
          ...hbl.generalInfo,
          parentBlIssuerPartyMpciId: carrierMpciCode,
        },
      };
    });

    // Do not retain records for deleted HBLs.
    autoFilledParentIssuerByHblRef.current.forEach((_, hblId) => {
      if (!activeHblIds.has(hblId)) {
        autoFilledParentIssuerByHblRef.current.delete(hblId);
      }
    });

    if (hasChanges) {
      // One Formik write and one validation pass, irrespective of HBL count.
      void setFieldValue("hblList", nextHblList, true);
    }
  }, [hblList, setFieldValue, values.carrierMpciCode]);

  const normalizedHblList = useMemo(
    () => hblList.map(ensureClientHblId),
    [hblList],
  );

  const existingHBLIds = useMemo(
    () => normalizedHblList.map(({ id }) => id),
    [normalizedHblList],
  );

  // These ids are the single source of truth for hiding linked shipments.
  // HBLAccordionItem delete removes the HBL from Formik, so the same id
  // naturally becomes available again in the modal's left pane only.
  const existingShipmentIds = useMemo(
    () =>
      normalizedHblList.map(
        ({ linkedShipmentId, id }) => linkedShipmentId ?? id,
      ),
    [normalizedHblList],
  );

  const handleAddHBL = useCallback(() => {
    const newHBL = hydrateNewHblWithContainerHeader(
      ensureClientHblId(initialHBLValue()),
      containerHeaders,
    );
    const updatedList = mergeUniqueHbls(latestHblListRef.current, [newHBL]);
    setFieldValue("hblList", updatedList);
    setExpandedHBL(newHBL.clientId);
  }, [containerHeaders, setFieldValue]);

  const handleAddHBLClick = () => {
    setAddingHBL(true);
    handleAddHBL();
    setAddingHBL(false);
  };

  const handlePopulateFromPdf = useCallback(
    async (hbls = []) => {
      if (!Array.isArray(hbls) || !hbls.length) return;

      const carrierMpciCode = String(values.carrierMpciCode ?? "").trim();
      const normalizedHbls = hbls.map((hbl) => {
        const normalizedHbl = ensureClientHblId(hbl);
        const parentIssuerMpciId = String(
          normalizedHbl?.generalInfo?.parentBlIssuerPartyMpciId ?? "",
        ).trim();

        // Populate before this batch is validated, so Add HBL does not briefly
        // create an error for a carrier value that is already available.
        if (!carrierMpciCode || parentIssuerMpciId) return normalizedHbl;

        return {
          ...normalizedHbl,
          generalInfo: {
            ...normalizedHbl.generalInfo,
            parentBlIssuerPartyMpciId: carrierMpciCode,
          },
        };
      });
      const nextContainerHeaders = buildContainerHeadersFromHbls(
        normalizedHbls,
        containerHeaders,
      );
      const nextHblList = mergeUniqueHbls(
        latestHblListRef.current,
        normalizedHbls,
      );

      await setFieldValue("containerHeaders", nextContainerHeaders, false);
      await setFieldValue("hblList", nextHblList, false);
      await setTouched(
        mergeTouchedTree(touched, "hblList", nextHblList),
        false,
      );
      await validateForm();
      setExpandedHBL(normalizedHbls[0]?.clientId || null);
    },
    [
      containerHeaders,
      setFieldValue,
      setTouched,
      touched,
      validateForm,
      values.carrierMpciCode,
    ],
  );

  /* ---------------- Delete HBL ---------------- */
  const handleDeleteHBL = useCallback(
    (targetHbl) => {
      const targetIdentity = getHblIdentity(targetHbl);
      const updated = latestHblListRef.current.filter(
        (hbl) => getHblIdentity(hbl) !== targetIdentity,
      );

      setFieldValue("hblList", updated);
      setExpandedHBL((prev) => (prev === targetHbl?.clientId ? null : prev));
    },
    [setFieldValue],
  );

  const toggleExpand = (clientId) =>
    setExpandedHBL((prev) => (prev === clientId ? null : clientId));

  return (
    <>
      <Paper sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            HBL Details
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <ProgressButton
              label="Add HBL"
              loadingStatus={addingHBL}
              onClick={handleAddHBLClick}
              icon={<AddIcon style={{ marginRight: 6 }} />}
              autoWidth
              color="#fff"
            />
            {showPdfExtraction && (
              <ProgressButton
                label="Upload PDF/Image"
                onClick={() => setPdfExtractionModalOpen(true)}
                icon={<PictureAsPdfIcon style={{ marginRight: 6 }} />}
                autoWidth
                color="#fff"
              />
            )}
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {!normalizedHblList.length ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                backgroundColor: "#fafafa",
                border: "1px dashed #e0e0e0",
              }}
            >
              <Typography color="text.secondary">
                No HBLs added. Use "Add HBL" or "Upload PDF/Image".
              </Typography>
            </Box>
          ) : (
            normalizedHblList.map((hbl, index) => (
              <HBLAccordionItem
                key={hbl.clientId}
                hbl={hbl}
                hblErrors={errors?.hblList?.[index] || {}}
                hblIndex={index}
                actionCode={values.actionCode}
                filingfor={values.filingfor}
                filingType={values.filingType}
                expanded={expandedHBL === hbl.clientId}
                onToggle={() => toggleExpand(hbl.clientId)}
                onDelete={() => handleDeleteHBL(hbl)}
              />
            ))
          )}
        </Box>
      </Paper>
      {showPdfExtraction && (
        <PdfExtractionModal
          open={pdfExtractionModalOpen}
          onClose={() => setPdfExtractionModalOpen(false)}
          onPopulateHbls={handlePopulateFromPdf}
        />
      )}
    </>
  );
};

const areEqual = (prevProps, nextProps) => {
  const prev = prevProps.formik || {};
  const next = nextProps.formik || {};

  return (
    prev.values?.hblList === next.values?.hblList &&
    prev.errors?.hblList === next.errors?.hblList &&
    prev.values?.containerHeaders === next.values?.containerHeaders &&
    prev.values?.actionCode === next.values?.actionCode &&
    prev.values?.filingfor === next.values?.filingfor &&
    prev.values?.filingType === next.values?.filingType &&
    prev.values?.carrierMpciCode === next.values?.carrierMpciCode &&
    prev.values?.efsAgentCodeField === next.values?.efsAgentCodeField
  );
};

export default connect(React.memo(HBLDetailsSection, areEqual));
