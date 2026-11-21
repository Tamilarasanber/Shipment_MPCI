import React, { memo, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Tooltip,
} from "@/components/ui/mui";
import { ExpandMoreIcon } from "@/components/ui/icons";
import ConfirmDeletePopover from "@/components/ui/ConfirmDeletePopover";
import { CheckCircleOutlineIcon } from "@/components/ui/icons";
import GeneralInfoTab from "./tabs/GeneralInfoTab";
import PartiesDetailsTab from "./tabs/PartiesDetailsTab";
import ContainerDetailsTab from "./tabs/ContainerDetailsTab";
import ItemDetailsTab from "./tabs/ItemDetailsTab";

import { useSelector } from "react-redux";
import { useMpciRules } from "../hooks/useMpciRules";
import { isVisible } from "../utils/mpciFieldUtils";
import { normalizeContainerNumberList } from "../utils/containerHeaderUtils";
import { hasValidationErrors } from "../utils/sectionCompletion";

const CONTACT_PARTY_TYPES_REQUIRING_DETAILS = ["INDIVIDUAL", "COMPANY"];
const CONTAINER_NUMBER_REGEX = /^[A-Z]{4}[0-9]{7}$/;

const HBLAccordionItem = ({
  hbl,
  hblErrors = {},
  hblIndex,
  actionCode,
  filingfor,
  filingType,
  expanded,
  onToggle,
  onDelete,
}) => {
  const { themeDetails } = useSelector((state) => state.Theme);
  const { data } = useSelector(
    (state) => state.DubaiFormFiling.selectedMPCIDetails,
  );
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // ---------- General Info tab tick button ----------
  const ruleInput = useMemo(
    () => ({
      filingfor,
      filingType,
      actionCode,
      futureChildBl: hbl.generalInfo?.futureChildBl,
    }),
    [filingfor, filingType, actionCode, hbl.generalInfo?.futureChildBl],
  );
  const rules = useMpciRules(ruleInput, "GeneralInfoTab");
  const isLiableVisible = isVisible("liablePartyMpciId", rules);

  const hasValue = (value) =>
    Array.isArray(value)
      ? value.length > 0
      : Boolean(String(value ?? "").trim());

  const getEffectiveGeneralInfo = (generalInfo = {}) => {
    const defaults = rules?.defaults || {};
    const merged = { ...generalInfo };

    Object.entries(defaults).forEach(([field, defaultValue]) => {
      if (!hasValue(merged[field]) && hasValue(defaultValue)) {
        merged[field] = defaultValue;
      }
    });

    return merged;
  };

  const isGeneralInfoValid = (generalInfo) => {
    if (!generalInfo) return false;
    const effectiveGeneralInfo = getEffectiveGeneralInfo(generalInfo);
    const isHblAmendmentFlow =
      effectiveGeneralInfo.actionCode === "U" ||
      effectiveGeneralInfo.actionCode === "C";

    const requiredFields = [
      "hblNo",
      "movementType",
      "cargoType",
      "blType",
      "portOfAcceptance",
      "endDestination",
      "parentBlIssuerPartyMpciId",
    ];
    // ✅ RULE BASED FIELDS
    if (isVisible("futureChildBl", rules)) {
      requiredFields.push("futureChildBl");
    }
    if (isVisible("parentBlNumber", rules)) {
      requiredFields.push("parentBlNumber");
    }
    if (isVisible("parentBlIssuerPartyName", rules)) {
      requiredFields.push("parentBlIssuerPartyName");
    }
    if (isVisible("filingPartyMpciID", rules)) {
      requiredFields.push("filingPartyMpciID");
    }
    if (isLiableVisible) {
      requiredFields.push("liablePartyMpciId");
    }

    // ✅ BUSINESS RULE
    if (effectiveGeneralInfo.movementType === "TRANSHIPMENT") {
      requiredFields.push("portOfTranshipment");
    }

    // ✅ AMENDMENT FLOW

    if (isHblAmendmentFlow) {
      requiredFields.push("amendmentType");
      requiredFields.push("filingRemarks");
    }
    // ✅ splitBl CHECK

    if (effectiveGeneralInfo.splitBl === "Yes") {
      requiredFields.push("originalNo");
    }

    // ✅ FINAL CHECK
    if (hasValue(effectiveGeneralInfo.invoiceAmount)) {
      requiredFields.push("currencyName");
    }

    const hasRequiredFields = requiredFields.every((field) =>
      hasValue(effectiveGeneralInfo[field]),
    );

    if (!hasRequiredFields) return false;

    // if (isHblAmendmentFlow && !hasValue(generalInfo.filingAttachments)) {
    //   return false;
    // }

    return true;
  };

  const isGeneralComplete = useMemo(
    () =>
      isGeneralInfoValid(hbl.generalInfo) &&
      !hasValidationErrors(hblErrors?.generalInfo),
    [hbl.generalInfo, hblErrors?.generalInfo, actionCode, rules, isLiableVisible],
  );
  const showGeneralTick = isGeneralComplete;

  // ---------- Parties tab tick button ----------
  const REQUIRED_PARTY_FIELDS = [
    "partyName",
    "address",
    "cityName",
    // "stateName",
    "countryName",
    // "poBox",
  ];

  const requiresPartyContactDetails = (party = {}) =>
    party.partyType === "Consignee" &&
    CONTACT_PARTY_TYPES_REQUIRING_DETAILS.includes(party.contactPartyType);
  const isNegotiableBlType = hbl.generalInfo?.blType === "Negotiable";
  const hasAnyCorePartyDetail = (party = {}) =>
    REQUIRED_PARTY_FIELDS.some((field) => hasValue(party[field]));

  const isSinglePartyValid = (party) => {
    if (!party) return false;
    const isConsignee = party.partyType === "Consignee";
    const hasContactDetail = hasValue(party.contactDetail);
    const hasMobile = hasValue(party.mobile);
    const hasEmail = hasValue(party.email);
    const requiresContactDetails = requiresPartyContactDetails(party);

    // 1️⃣ Common required fields
    if (!(isConsignee && isNegotiableBlType) || hasAnyCorePartyDetail(party)) {
      for (const field of REQUIRED_PARTY_FIELDS) {
        if (!hasValue(party[field])) {
          return false;
        }
      }
    }

    // 2️⃣ Consignee qualifier rule
    if (isConsignee) {
      if (hasValue(party.qualifier) && !hasValue(party.identifierNo)) {
        return false;
      }

      if (hasValue(party.identifierNo) && !hasValue(party.qualifier)) {
        return false;
      }
    }

    // 3️⃣ Consignee specific
    if (
      isConsignee &&
      (requiresContactDetails || hasMobile || hasEmail) &&
      !hasContactDetail
    ) {
      return false;
    }

    if (isConsignee && hasContactDetail && !hasValue(party.contactPartyType)) {
      return false;
    }

    if (
      isConsignee &&
      (requiresContactDetails || hasContactDetail) &&
      !hasMobile &&
      !hasEmail
    ) {
      return false;
    }

    return true;
  };

  const isPartiesComplete = useMemo(
    () =>
      Array.isArray(hbl.parties) &&
      hbl.parties.length > 0 &&
      hbl.parties.every(isSinglePartyValid) &&
      !hasValidationErrors(hblErrors?.parties),
    [hbl.parties, hblErrors?.parties, isNegotiableBlType],
  );
  const showPartiesTick = isPartiesComplete;

  // container tab tick button
  const isFurtherChildBLYes = hbl.generalInfo?.futureChildBl === "Yes";
  const REQUIRED_CONTAINER_FIELDS = [
    "containerNo",
    "containerStatus",
    ...(isFurtherChildBLYes ? [] : ["containerCode"]),
  ];
  const hasAtLeastOneSeal = (container) => {
    return Boolean(
      container?.shipperSeal?.trim() ||
      container?.carrierSeal?.trim() ||
      container?.customsSeal?.trim(),
    );
  };

  const isSingleContainerValid = (container) => {
    if (!container) return false;

    // 1️⃣ Required basic fields
    for (const field of REQUIRED_CONTAINER_FIELDS) {
      if (field === "containerNo") {
        const normalizedContainerNumbers = normalizeContainerNumberList(
          container[field],
        );

        if (!normalizedContainerNumbers.length) {
          return false;
        }

        if (
          !normalizedContainerNumbers.every((value) =>
            CONTAINER_NUMBER_REGEX.test(value),
          )
        ) {
          return false;
        }
        continue;
      }

      if (!container[field]) {
        return false;
      }
    }

    // 2️⃣ At least one seal required (schema mirror)
    if (!hasAtLeastOneSeal(container)) {
      return false;
    }

    // Customs Seal entered -> Sealing Party Name becomes mandatory
    if (
      container?.customsSeal?.trim() &&
      !container?.sealingPartyName?.trim()
    ) {
      return false;
    }

    // Reefer Cargo ON -> Temperature and Unit Code are mandatory
    if (container?.reeferCargo) {
      if (!hasValue(container?.temperature) || !hasValue(container?.unitCode)) {
        return false;
      }
    }

    return true;
  };
  const isContainersComplete = useMemo(
    () =>
      Array.isArray(hbl.containers) &&
      hbl.containers.length > 0 &&
      hbl.containers.every(isSingleContainerValid) &&
      !hasValidationErrors(hblErrors?.containers),
    [hbl.containers, hblErrors?.containers, isFurtherChildBLYes],
  );

  // ---------- items Info tab tick button ----------

  const REQUIRED_ITEM_FIELDS = [
    "containerNo",
    "numberOfPackages",
    "packageTypeName",
    "cargoGrossWeight",
    "itemDescription",
    "marksAndNumbers",
  ];
  const isHsCodeRequired = hbl.generalInfo?.futureChildBl !== "Yes";
  const dangerousContainerNoSet = useMemo(() => {
    const dangerousContainerNos = new Set();

    (hbl.containers || []).forEach((container) => {
      if (!container?.dangerousGoods) return;

      normalizeContainerNumberList(container.containerNo).forEach(
        (containerNo) => dangerousContainerNos.add(containerNo),
      );
    });

    return dangerousContainerNos;
  }, [hbl.containers]);

  const isSingleItemValid = (
    item,
    dangerousContainerNos,
    hsCodeRequired,
  ) => {
    if (!item) return false;

    // 1️⃣ Required fields check
    for (const field of REQUIRED_ITEM_FIELDS) {
      if (field === "containerNo") {
        if (!Array.isArray(item.containerNo) || item.containerNo.length === 0) {
          return false;
        }
      } else if (!hasValue(item[field])) {
        return false;
      }
    }

    // if (
    //   hsCodeRequired &&
    //   (!Array.isArray(item.hsCode) || item.hsCode.length === 0)
    // ) {
    //   return false;
    // }
    if (hsCodeRequired && !String(item.hsCode ?? "").trim()) {
      return false;
    }

    // 2️⃣ Dangerous goods conditional check
    const itemHasDangerousGoods = normalizeContainerNumberList(
      item.containerNo,
    ).some((containerNo) => dangerousContainerNos.has(containerNo));

    if (itemHasDangerousGoods) {
      if (!item.imoClass || !item.unCode) {
        return false;
      }
    }

    return true;
  };
  const isItemDetailsComplete = useMemo(
    () =>
      Array.isArray(hbl.items) &&
      hbl.items.length > 0 &&
      hbl.items.every((item) =>
        isSingleItemValid(
          item,
          dangerousContainerNoSet,
          isHsCodeRequired,
        ),
      ) &&
      !hasValidationErrors(hblErrors?.items),
    [
      hbl.items,
      hblErrors?.items,
      dangerousContainerNoSet,
      isHsCodeRequired,
    ],
  );
  // ConfirmDeletePopover hide from persistedBlIds
  const persistedBlIds = useMemo(
    () => new Set((data?.blDetailsList || []).map((bl) => String(bl.id))),
    [data?.blDetailsList],
  );

  const shouldShowDeleteAction = useMemo(
    () => !hbl?.id || !persistedBlIds.has(String(hbl.id)),
    [hbl?.id, persistedBlIds],
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      TransitionProps={{ unmountOnExit: true }}
      sx={{
        marginBottom: "8px !important",
        "&:before": { display: "none" },
        boxShadow: "none",
        border: "1px solid #e0e0e0",
        borderRadius: "4px !important",
        "&.Mui-expanded": {
          margin: "0 0 8px 0",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          // backgroundColor: "#f5f5f5",
          //  background: "linear-gradient(90deg,#7B61FF 0%, #4F8CFF 100%)",
          background: themeDetails.AccordionSecondaryBackgroundColor,
          color: "#fff",
          borderRadius: expanded ? "4px 4px 0 0" : "4px",
          minHeight: 48,
          "&.Mui-expanded": {
            minHeight: 48,
          },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            alignItems: "center",
            gap: 1,
            justifyContent: "space-between",
            width: "100%",
          },
        }}
        // sx={{
        //   background: "linear-gradient(90deg,#2E7DFF 0%, #00C6FF 100%)",
        //   px: 3,
        //   py: 1.5,
        //   minHeight: 64,
        //   color: "#fff",

        //   "& .MuiAccordionSummary-content": {
        //     alignItems: "center",
        //     justifyContent: "space-between",
        //   },
        // }}
      >
        {/* <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#333" }}>
          {hbl.hblNo}
        </Typography>
        {isGeneralComplete && isPartiesComplete && isContainersComplete && (
          <CheckCircleOutlineIcon sx={{ color: "#4caf50", fontSize: 20 }} />
        )} */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ color: "#fff" }}
          >
            {hbl.generalInfo.hblNo}
          </Typography>
          {isGeneralComplete &&
            isPartiesComplete &&
            isContainersComplete &&
            isItemDetailsComplete && (
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: 22,
                  color: themeDetails.CheckCircleOutlineColor,
                  filter: themeDetails.CheckCircleOutlineFilter,
                }}
              />
            )}
        </Box>
        {shouldShowDeleteAction && (
          <Tooltip title="Delete HBL">
            <ConfirmDeletePopover
              message="Are you sure you want to delete this HBL?"
              onConfirm={() => {
                onDelete();
              }}
            />
          </Tooltip>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                minHeight: 44,
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#666",
                "&.Mui-selected": {
                  color: themeDetails.buttonColor,
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: themeDetails.buttonColor,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  General Information
                  {showGeneralTick && (
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: 16,
                        color: themeDetails.CheckCircleOutlineColorSecondary,
                      }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Parties Details
                  {showPartiesTick && (
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: 16,
                        color: themeDetails.CheckCircleOutlineColorSecondary,
                      }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Container Details
                  {isContainersComplete && (
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: 16,
                        color: themeDetails.CheckCircleOutlineColorSecondary,
                      }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Item Details
                  {isItemDetailsComplete && (
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: 16,
                        color: themeDetails.CheckCircleOutlineColorSecondary,
                      }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <GeneralInfoTab hblIndex={hblIndex} />}
          {activeTab === 1 && (
            <PartiesDetailsTab
              parties={hbl.parties || []}
              hblIndex={hblIndex}
            />
          )}
          {activeTab === 2 && (
            <ContainerDetailsTab
              containers={hbl.containers || []}
              hblIndex={hblIndex}
            />
          )}
          {activeTab === 3 && (
            <ItemDetailsTab items={hbl.items || []} hblIndex={hblIndex} />
          )}
          {/* {activeTab === 3 && <ItemDetailsTab />} */}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

const areEqual = (prevProps, nextProps) =>
  prevProps.hbl === nextProps.hbl &&
  prevProps.hblErrors === nextProps.hblErrors &&
  prevProps.actionCode === nextProps.actionCode &&
  prevProps.filingfor === nextProps.filingfor &&
  prevProps.filingType === nextProps.filingType &&
  prevProps.hblIndex === nextProps.hblIndex &&
  prevProps.expanded === nextProps.expanded;

export default memo(HBLAccordionItem, areEqual);
