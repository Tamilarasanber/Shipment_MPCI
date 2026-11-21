import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Grid,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  Tooltip,
} from "@/components/ui/mui";
import { getIn, useFormikContext } from "formik";
import { useDispatch, useSelector } from "react-redux";
// import { getPortFieldRequest } from "../../../../Redux/Actions/SailingAction";
import SearchableAutocomplete from "@/components/ui/SearchableAutocomplete";
import CountryFlag from "@/components/ui/CountryFlag";
import { SlAnchor } from "@/components/ui/icons";
import { ExpandMoreIcon } from "@/components/ui/icons";
import { ExpandLessIcon } from "@/components/ui/icons";
import { useMpciRules } from "../../hooks/useMpciRules";
import {
  fetchMpciMasterRequest,
  fetchMPCIAttachmentsByBlRequest,
} from "@/redux/actions/dubaiMpciAction";
import { isVisible, isDisabled } from "../../utils/mpciFieldUtils";
import { getAmendmentTypeOptions } from "../../utils/amendmentType.utils";
import FormikAttachmentField from "../Attachment/FormikAttachmentField";
import {
  FormikTextField,
  FormikSelect,
  FormikDatePicker,
  FormikTextFieldWithPopup,
} from "@/components/ui/FormikFields";
import {
  actionCodeHBLOptions,
  furtherChildBlOptions,
  movementTypeOptions,
  blTypeOptions,
  cargoTypeOptions,
  emirateOptions,
  freightPrepaidAndCollectOptions,
  serviceRequirementOptions,
  amendmentTypeOptions,
} from "../../constants/selectOptions";
import { PORT_TRANSPORT_MODE_OCEAN_ROAD_RAIL, PORT_TRANSPORT_MODE_OCEAN } from "../../constants/portTransportMode";

/* ---------- options unchanged (same as your code) ---------- */

const GeneralInfoTab = ({ hblIndex }) => {
  // console.log("GeneralInfo re-render")
  const {
    handleBlur,
    setFieldValue,
    validateField,
    errors,
    touched,
    values,
    handleChange,
    submitCount,
  } = useFormikContext();
  const hblActionCodePath = `hblList.${hblIndex}.generalInfo.actionCode`;
  const parentBlIssuerPartyMpciIdPath = `hblList[${hblIndex}].generalInfo.parentBlIssuerPartyMpciId`;
  const currentGeneralInfo = values?.hblList?.[hblIndex]?.generalInfo || {};
  const currentGeneralInfoErrors =
    errors?.hblList?.[hblIndex]?.generalInfo || {};
  const hblActionCode =
    values.hblList?.[hblIndex]?.generalInfo?.actionCode || "";
  const isRootAmendmentFlow =
    values.actionCode === "U" || values.actionCode === "C";
  const isHblAmendmentFlow = hblActionCode === "U" || hblActionCode === "C";
  const amendmentTypePath = `hblList.${hblIndex}.generalInfo.amendmentType`;
  const filingRemarksPath = `hblList.${hblIndex}.generalInfo.filingRemarks`;
  const filingAttachmentsPath = `hblList.${hblIndex}.generalInfo.filingAttachments`;
  const currentHblActionValue = getIn(values, hblActionCodePath);
  const currentAmendmentType = getIn(values, amendmentTypePath);
  const currentFilingRemarks = getIn(values, filingRemarksPath);
  const currentFilingAttachmentsLength = (
    getIn(values, filingAttachmentsPath) || []
  ).length;
  const currentBlId = useMemo(() => {
    const rawBlId = values?.hblList?.[hblIndex]?.id;
    const normalizedBlId = Number(rawBlId);
    return Number.isFinite(normalizedBlId) && normalizedBlId > 0
      ? normalizedBlId
      : null;
  }, [values?.hblList, hblIndex]);
  const fetchedAttachmentBlRef = useRef(null);
  const confirmedParentIssuerMismatchRef = useRef(new Set());
  const [parentIssuerMismatch, setParentIssuerMismatch] = useState(null);
  //  Only pass fields required for rules (prevents re-render storm)
  const ruleInput = useMemo(
    () => ({
      filingfor: values.filingfor,
      filingType: values.filingType,
      actionCode: values.actionCode,
      futureChildBl: values.hblList?.[hblIndex]?.generalInfo?.futureChildBl,
    }),
    [
      values.filingfor,
      values.filingType,
      values.actionCode,
      values.hblList?.[hblIndex]?.generalInfo?.futureChildBl,
    ],
  );
  // amendment type options based on action code
  const amendmentOptions = useMemo(
    () => getAmendmentTypeOptions(hblActionCode, amendmentTypeOptions),
    [hblActionCode],
  );

  const dispatch = useDispatch();

  // const { portFieldList, portLoading } = useSelector(
  //   (state) => state.SailingSchedule,
  // );

  const {
    portOfAcceptanceList,
    portOfTranshipmentList,
    endDestinationList,
    placeOfBillIssueList,
    placeOfFreightPaymentList,
    currencyList,
    loading,
  } = useSelector((state) => state.DubaiFormFiling?.generalInfoDetails || {});
  // Dispatch for Master data

  const handleMasterSearch = useCallback(
    ({ type, section, targetField, transportMode }) =>
      (text) => {
        if (!text || text.length < 2) return;

        dispatch(
          fetchMpciMasterRequest({
            type,
            searchText: text,
            section,
            targetField,
            ...(transportMode ? { transportMode } : {}),
          }),
        );
      },
    [dispatch],
  );

  const hasError = (field) =>
    Boolean((getIn(touched, field) || submitCount > 0) && getIn(errors, field));

  const helperText = (field) =>
    getIn(touched, field) || submitCount > 0 ? getIn(errors, field) || "" : "";

  const isCurrencyRequired = Boolean(
    String(values.hblList?.[hblIndex]?.generalInfo?.invoiceAmount ?? "").trim(),
  );

  // Parent BL Party MPCI ID  Mismatch popup function start
  const handleParentIssuerMpciIdBlur = useCallback(
    (event) => {
      const carrierMpciCode = String(values.carrierMpciCode ?? "").trim();
      const parentIssuerMpciId = String(event.target.value ?? "").trim();

      // Preserve auto-fill behavior when either value is absent or both match.
      if (
        !carrierMpciCode ||
        !parentIssuerMpciId ||
        carrierMpciCode === parentIssuerMpciId
      ) {
        return;
      }

      const mismatchKey = `${carrierMpciCode}\u0000${parentIssuerMpciId}`;
      if (confirmedParentIssuerMismatchRef.current.has(mismatchKey)) return;

      setParentIssuerMismatch({
        carrierMpciCode,
        parentIssuerMpciId,
        mismatchKey,
      });
    },
    [values.carrierMpciCode],
  );

  const keepParentIssuerMpciId = useCallback(() => {
    if (parentIssuerMismatch) {
      confirmedParentIssuerMismatchRef.current.add(
        parentIssuerMismatch.mismatchKey,
      );
    }
    setParentIssuerMismatch(null);
  }, [parentIssuerMismatch]);

  const resetParentIssuerMpciId = useCallback(() => {
    if (!parentIssuerMismatch) return;

    void setFieldValue(
      parentBlIssuerPartyMpciIdPath,
      parentIssuerMismatch.carrierMpciCode,
      true,
    );
    setParentIssuerMismatch(null);
  }, [parentIssuerMismatch, parentBlIssuerPartyMpciIdPath, setFieldValue]);
  // Parent BL Party MPCI ID  Mismatch popup function end
  // console.log("VALUES =>", JSON.stringify(values, null, 2));
  /* useEffect(() => {
    const partiesPath = `hblList.${hblIndex}.parties`;
    const parties = getIn(values, partiesPath) || [];

    const hasConsignee = parties.some((p) => p.partyType === "Consignee");

    // 🔴 Non-Negotiable → Consignee MUST exist
    if (hasSupportedBlType && !hasConsignee) {
      setFieldValue(
        partiesPath,
        [...parties, buildConsigneePartyFromSummary()],
        false,
      );
    }

    // 🟢 Other BL Types → Consignee optional (remove auto-added one)
  }, [
    values.hblList?.[hblIndex]?.generalInfo?.blType,
    hasSupportedBlType,
    hblIndex,
    setFieldValue,
    buildConsigneePartyFromSummary,
  ]); */

  const popupFormik = useMemo(
    () => ({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      submitCount,
    }),
    [values, errors, touched, handleChange, handleBlur, submitCount],
  );

  /* ---------- Expand view more and view less ---------- */
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  // port flag and portname and portcode

  const renderPortOption = useCallback((props, option) => {
    const { key, ...rest } = props;

    return (
      <Box
        key={key}
        component="li"
        {...rest}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <CountryFlag countryCode={option.portCountry} />
        <Box ml={1} flexGrow={1}>
          <div>
            {option.displayLabel || `${option.portName} (${option.portCode})`}
          </div>
          <div>{option.portCountry}</div>
        </Box>
        <SlAnchor size={18} />
      </Box>
    );
  }, []);

  // condtional rendering based on rules
  const rules = useMpciRules(ruleInput, "GeneralInfoTab");

  useEffect(() => {
    Object.entries(rules.defaults || {}).forEach(([field, defaultValue]) => {
      const path = `hblList[${hblIndex}].generalInfo.${field}`;
      const currentValue = currentGeneralInfo?.[field];
      const hasExistingError = Boolean(currentGeneralInfoErrors?.[field]);

      //  prevent unnecessary formik updates (stops re-render loop)
      if (currentValue !== defaultValue) {
        void (async () => {
          // Update value without global revalidation (perf)
          await setFieldValue(path, defaultValue, false);

          // Only revalidate this field when an existing error is present
          // (or after submit attempt) to clear stale messages.
          if (validateField && (hasExistingError || submitCount > 0)) {
            validateField(path);
          }
        })();
      }
    });
  }, [
    rules.defaults,
    hblIndex,
    currentGeneralInfo,
    currentGeneralInfoErrors,
    submitCount,
    setFieldValue,
    validateField,
  ]);

  // condtional rendering

  useEffect(() => {
    if (!isRootAmendmentFlow) {
      if (currentHblActionValue) {
        setFieldValue(hblActionCodePath, "", false);
      }
      if (currentAmendmentType) {
        setFieldValue(amendmentTypePath, "", false);
      }
      if (currentFilingRemarks) {
        setFieldValue(filingRemarksPath, "", false);
      }
      if (currentFilingAttachmentsLength > 0) {
        setFieldValue(filingAttachmentsPath, [], false);
      }
    }
  }, [
    isRootAmendmentFlow,
    hblActionCodePath,
    amendmentTypePath,
    filingRemarksPath,
    filingAttachmentsPath,
    currentHblActionValue,
    currentAmendmentType,
    currentFilingRemarks,
    currentFilingAttachmentsLength,
    setFieldValue,
  ]);

  useEffect(() => {
    if (!isHblAmendmentFlow) {
      if (currentAmendmentType) {
        setFieldValue(amendmentTypePath, "", false);
      }
      if (currentFilingRemarks) {
        setFieldValue(filingRemarksPath, "", false);
      }
      if (currentFilingAttachmentsLength > 0) {
        setFieldValue(filingAttachmentsPath, [], false);
      }
      fetchedAttachmentBlRef.current = null;
    }
  }, [
    isHblAmendmentFlow,
    amendmentTypePath,
    filingRemarksPath,
    filingAttachmentsPath,
    currentAmendmentType,
    currentFilingRemarks,
    currentFilingAttachmentsLength,
    setFieldValue,
  ]);

  useEffect(() => {
    if (!isHblAmendmentFlow) return;
    if (!currentBlId) return;
    if (fetchedAttachmentBlRef.current === currentBlId) return;

    dispatch(fetchMPCIAttachmentsByBlRequest({ blId: currentBlId }));
    fetchedAttachmentBlRef.current = currentBlId;
  }, [dispatch, isHblAmendmentFlow, currentBlId]);

  // conditional required for transhipment
  const isTranshipment =
    values.hblList[hblIndex]?.generalInfo?.movementType === "TRANSHIPMENT";

  // clear port of transhipment if movement type is not transhipment
  // useEffect(() => {
  //   const path = `hblList[${hblIndex}].generalInfo.portOfTranshipment`;

  //   if (
  //     values.hblList[hblIndex]?.generalInfo?.movementType !== "Transhipment" &&
  //     getIn(values, path)
  //   ) {
  //     setFieldValue(path, "", false); // clear without validation
  //   }
  // }, [values.hblList[hblIndex]?.generalInfo?.movementType]);

  // clear amendment type if not in options (handles dynamic options based on action code)
  useEffect(() => {
    if (
      currentAmendmentType &&
      !amendmentOptions.some((o) => o.value === currentAmendmentType)
    ) {
      setFieldValue(amendmentTypePath, "", false);
    }
  }, [
    amendmentOptions,
    currentAmendmentType,
    amendmentTypePath,
    setFieldValue,
  ]);

  const isEditableFutureChildBl = values.filingType === "MCL";

  return (
    <Grid container spacing={2.5}>
      {/* 1st order field */}

      {/* HBL No */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikTextField
          name={`hblList[${hblIndex}].generalInfo.hblNo`}
          label="HBL No."
          trimSpaces
          required
          // disabled
        />
      </Grid>
      {/* Further Child BL */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikSelect
          name={`hblList[${hblIndex}].generalInfo.futureChildBl`}
          label="Further Child BL?"
          options={furtherChildBlOptions}
          required
        />
      </Grid> */}
      {isVisible("futureChildBl", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isEditableFutureChildBl ? (
            <FormikSelect
              name={`hblList[${hblIndex}].generalInfo.futureChildBl`}
              label="Further Child BL?"
              options={furtherChildBlOptions}
              required
            />
          ) : (
            <FormikTextField
              name={`hblList[${hblIndex}].generalInfo.futureChildBl`}
              label="Further Child BL?"
              disabled
            />
          )}
        </Grid>
      )}

      {/* Parent BL Number */}
      {isVisible("parentBlNumber", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextField
            name={`hblList[${hblIndex}].generalInfo.parentBlNumber`}
            label="Parent BL Number"
            trimSpaces
            required
          />
        </Grid>
      )}

      {/* Parent BL Number 2 */}
      {/* {isVisible("parentBlNumber", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextField
            name={`hblList[${hblIndex}].generalInfo.parentBlNumber`}
            label="Parent BL Number"
            required
          />
        </Grid>
      )} */}

      {/* Parent BL Issuing Party Name */}
      {isVisible("parentBlIssuerPartyName", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextField
            name={`hblList[${hblIndex}].generalInfo.parentBlIssuerPartyName`}
            label="Parent BL Issuing Party Name"
            required
          />
        </Grid>
      )}

      {/* Parent BL Issuing Party MPCI ID */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikTextField
          name={`hblList[${hblIndex}].generalInfo.parentBlIssuerPartyMpciId`}
          label="Parent BL Party MPCI ID"
          required
        />
      </Grid> */}
      {isVisible("parentBlIssuerPartyMpciId", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextField
            name={`hblList[${hblIndex}].generalInfo.parentBlIssuerPartyMpciId`}
            label="Parent BL Party MPCI ID"
            trimSpaces
            required
            onFieldBlur={handleParentIssuerMpciIdBlur}
          />
        </Grid>
      )}

      {/* Filing Party MPCI ID */}
      {isVisible("filingPartyMpciID", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextField
            name={`hblList[${hblIndex}].generalInfo.filingPartyMpciID`}
            label="Filing Party MPCI ID"
            trimSpaces
            required
          />
        </Grid>
      )}

      {/* Liable UAE Party MPCI ID */}
      {isVisible("liablePartyMpciId", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextField
            name={`hblList[${hblIndex}].generalInfo.liablePartyMpciId`}
            label="Liable UAE Party MPCI ID"
            trimSpaces
            required
          />
        </Grid>
      )}

      {/* Movement Type */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikSelect
          name={`hblList[${hblIndex}].generalInfo.movementType`}
          label="Movement Type"
          options={movementTypeOptions}
          onValueChange={(value) => {
            if (value !== "TRANSHIPMENT") {
              const path = `hblList[${hblIndex}].generalInfo.portOfTranshipment`;
              if (getIn(values, path)) {
                setFieldValue(path, "", false);
              }
            }
          }}
          required
        />
      </Grid>

      {/* BL Type */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikSelect
          name={`hblList[${hblIndex}].generalInfo.blType`}
          label="BL Type"
          options={blTypeOptions}
          required
        />
      </Grid>

      {/* Cargo Type */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikSelect
          name={`hblList[${hblIndex}].generalInfo.cargoType`}
          required
          label="Cargo Type"
          options={cargoTypeOptions}
        />
      </Grid>

      {/* Port of Acceptance */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SearchableAutocomplete
          name={`hblList[${hblIndex}].generalInfo.portOfAcceptance`}
          label="Port Of Acceptance"
          value={values.hblList[hblIndex]?.generalInfo?.portOfAcceptance || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          options={portOfAcceptanceList}
          loading={loading}
          onSearch={handleMasterSearch({
            type: "PORTNAME",
            section: "generalInfoDetails",
            targetField: "portOfAcceptanceList",
            transportMode: PORT_TRANSPORT_MODE_OCEAN_ROAD_RAIL,
          })}
          getOptionLabelKey="portName"
          getOptionValueKey="portName"
          additionalFieldMappings={{ portOfAcceptanceId: "id" }}
          renderCustomOption={renderPortOption}
          required
          error={hasError(`hblList[${hblIndex}].generalInfo.portOfAcceptance`)}
          helperText={helperText(
            `hblList[${hblIndex}].generalInfo.portOfAcceptance`,
          )}
        />
      </Grid>

      {/* End Destination */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SearchableAutocomplete
          name={`hblList[${hblIndex}].generalInfo.endDestination`}
          label="Port Of End Destination"
          value={values.hblList[hblIndex]?.generalInfo?.endDestination || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          options={endDestinationList}
          loading={loading}
          onSearch={handleMasterSearch({
            type: "PORTNAME",
            section: "generalInfoDetails",
            targetField: "endDestinationList",
            transportMode: PORT_TRANSPORT_MODE_OCEAN_ROAD_RAIL,
          })}
          getOptionLabelKey="portName"
          getOptionValueKey="portName"
          additionalFieldMappings={{ endDestinationId: "id" }}
          renderCustomOption={renderPortOption}
          required
          error={hasError(`hblList[${hblIndex}].generalInfo.endDestination`)}
          helperText={helperText(
            `hblList[${hblIndex}].generalInfo.endDestination`,
          )}
        />
      </Grid>

      {/* Port Of Transhipment */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SearchableAutocomplete
          name={`hblList[${hblIndex}].generalInfo.portOfTranshipment`}
          label="Port Of Transhipment"
          value={
            values.hblList[hblIndex]?.generalInfo?.portOfTranshipment || ""
          }
          onChange={handleChange}
          onBlur={handleBlur}
          options={portOfTranshipmentList}
          loading={loading}
          onSearch={handleMasterSearch({
            type: "PORTNAME",
            section: "generalInfoDetails",
            targetField: "portOfTranshipmentList",
            transportMode: PORT_TRANSPORT_MODE_OCEAN,
          })}
          getOptionLabelKey="portName"
          getOptionValueKey="portName"
          additionalFieldMappings={{ portOfTranshipmentId: "id" }}
          renderCustomOption={renderPortOption}
          required={isTranshipment}
          error={
            isTranshipment &&
            hasError(`hblList[${hblIndex}].generalInfo.portOfTranshipment`)
          }
          helperText={
            isTranshipment
              ? helperText(
                  `hblList[${hblIndex}].generalInfo.portOfTranshipment`,
                )
              : ""
          }
        />
      </Grid>

      <Grid container spacing={2.5} size={{ xs: 12, sm: 12, md: 12 }}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", gap: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    values.hblList[hblIndex]?.generalInfo?.splitBl === "Yes"
                  }
                  onChange={(e) => {
                    const checked = e.target.checked;

                    const value = checked ? "Yes" : "No";

                    setFieldValue(
                      `hblList.${hblIndex}.generalInfo.splitBl`,
                      value,
                    );
                  }}
                />
              }
              label="Split BL"
            />
            {values.hblList[hblIndex]?.generalInfo?.splitBl === "Yes" && (
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormikTextField
                  name={`hblList[${hblIndex}].generalInfo.originalNo`}
                  label="Original BL Number"
                  required
                />
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* HBL Action Code */}
      {isRootAmendmentFlow && (
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormikSelect
            name={`hblList[${hblIndex}].generalInfo.actionCode`}
            label="Action"
            options={actionCodeHBLOptions}
          />
        </Grid>
      )}

      {/* Amendment Type */}
      {isHblAmendmentFlow && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikSelect
            name={`hblList[${hblIndex}].generalInfo.amendmentType`}
            label="Amendment Type"
            options={amendmentOptions}
            required
          />
        </Grid>
      )}

      {/* Filing Remarks */}
      {isHblAmendmentFlow && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextFieldWithPopup
            name={`hblList.${hblIndex}.generalInfo.filingRemarks`}
            label="Filing Remarks"
            popupTitle="Filing Remarks"
            required
            formik={popupFormik}
          />
        </Grid>
      )}

      {/* Attachement */}
      {isHblAmendmentFlow && (
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormikAttachmentField
            label="Attachments"
            name={`hblList.${hblIndex}.generalInfo.filingAttachments`}
            // required
          />
        </Grid>
      )}

      {/* View More / Less */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          mt: 1,
        }}
      >
        <Button
          size="small"
          onClick={toggleExpand}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ textTransform: "none" }}
        >
          {expanded ? "View Less" : "View More"}
        </Button>
      </Box>

      {expanded && (
        <>
          {/* 2nd order field */}

          {/* BL Date */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormikDatePicker
              name={`hblList[${hblIndex}].generalInfo.blDate`}
              label="BL Date"
              // formik={{ values, errors, touched, setFieldValue }}
              sx={{ "& .MuiInputBase-root": { height: 40 } }}
            />
          </Grid>

          {/* Emirate */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormikSelect
              name={`hblList[${hblIndex}].generalInfo.emirate`}
              label="Emirate"
              options={emirateOptions}
            />
          </Grid>

          {/* Place of Bill Issue */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {/* <SearchableAutocomplete
              name={`hblList[${hblIndex}].generalInfo.placeOfBillIssueName`}
              label="Place of Bill Issue"
              value={
                values.hblList[hblIndex]?.generalInfo?.placeOfBillIssueName ||
                ""
              }
              onChange={handleChange}
              onBlur={handleBlur}
              options={placeOfBillIssueList}
              loading={loading}
              onSearch={handleMasterSearch({
                type: "PORTNAME",
                section: "generalInfoDetails",
                targetField: "placeOfBillIssueList",
              })}
              getOptionLabelKey="portName"
              getOptionValueKey="portName"
              additionalFieldMappings={{ placeOfBillIssueId: "id" }}
              renderCustomOption={renderPortOption}
              error={hasError(
                `hblList[${hblIndex}].generalInfo.placeOfBillIssueName`,
              )}
              helperText={helperText(
                `hblList[${hblIndex}].generalInfo.placeOfBillIssueName`,
              )}
            /> */}
             <FormikTextField
          name={`hblList[${hblIndex}].generalInfo.placeOfBillIssueName`}
          label="Place of Bill Issue"
        />
          </Grid>

          {/* Place of freight payment */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          
            {/* <SearchableAutocomplete
              name={`hblList[${hblIndex}].generalInfo.placeOfFreightPaymentName`}
              label="Place of freight payment"
              value={
                values.hblList[hblIndex]?.generalInfo
                  ?.placeOfFreightPaymentName || ""
              }
              onChange={handleChange}
              onBlur={handleBlur}
              options={placeOfFreightPaymentList}
              loading={loading}
              onSearch={handleMasterSearch({
                type: "PORTNAME",
                section: "generalInfoDetails",
                targetField: "placeOfFreightPaymentList",
              })}
              getOptionLabelKey="portName"
              getOptionValueKey="portName"
              additionalFieldMappings={{ placeOfFreightPaymentId: "id" }}
              renderCustomOption={renderPortOption}
              error={hasError(
                `hblList[${hblIndex}].generalInfo.placeOfFreightPaymentName`,
              )}
              helperText={helperText(
                `hblList[${hblIndex}].generalInfo.placeOfFreightPaymentName`,
              )}
            /> */}
             <FormikTextField
          name={`hblList[${hblIndex}].generalInfo.placeOfFreightPaymentName`}
          label="Place of freight payment"
        />
          </Grid>

          {/* Freight Prepaid/Collect */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormikSelect
              name={`hblList[${hblIndex}].generalInfo.freightPaymentType`}
              label="Freight"
              options={freightPrepaidAndCollectOptions}
            />
          </Grid>
          {/* Invoice Amount of the consignment */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
             <Tooltip title="Example: 12345.67 (max 15 digits before decimal, up to 2 decimal places)">
              <FormikTextField
              name={`hblList[${hblIndex}].generalInfo.invoiceAmount`}
              label="Invoice Amount"
              type="text"
              inputProps={{ inputMode: "decimal", maxLength: 35 }}
            />
</Tooltip>
            
          </Grid>

          {/* Currency */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            {/* <SearchableAutocomplete
              name={`hblList[${hblIndex}].generalInfo.currency`}
              label="Currency"
              value={values.hblList[hblIndex]?.generalInfo?.currency || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              options={currencyOptions}
            /> */}
            <SearchableAutocomplete
              name={`hblList[${hblIndex}].generalInfo.currencyName`}
              label="Currency"
              value={values.hblList[hblIndex]?.generalInfo?.currencyName || ""}
              onChange={handleChange}
              onSearch={handleMasterSearch({
                type: "CURRENCY",
                section: "generalInfoDetails",
                targetField: "currencyList",
              })}
              onBlur={handleBlur}
              options={currencyList}
              loading={loading}
              getOptionLabelKey="name"
              getOptionValueKey="name"
              additionalFieldMappings={{ currencyId: "id" }}
              required={isCurrencyRequired}
              error={hasError(`hblList[${hblIndex}].generalInfo.currencyName`)}
              helperText={helperText(
                `hblList[${hblIndex}].generalInfo.currencyName`,
              )}
            />
          </Grid>

          {/* Service requirement */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormikSelect
              name={`hblList[${hblIndex}].generalInfo.serviceRequirement`}
              label="Service requirement"
              options={serviceRequirementOptions}
            />
          </Grid>

          {/* Remarks */}
          <Tooltip title="Enter Remarks (512 characters)">
             <Grid size={{ xs: 12, sm: 6, md: 3 }}>  
            <FormikTextFieldWithPopup
              name={`hblList[${hblIndex}].generalInfo.remarks`}
              label="Remarks"
              popupTitle="Remarks"
              formik={{
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
              }}
            />
          </Grid>
</Tooltip>
         
        </>
      )}
      {/* Parent BL Party MPCI ID  Mismatch */}
      <Dialog
        open={Boolean(parentIssuerMismatch)}
        onClose={resetParentIssuerMpciId}
        aria-labelledby="parent-issuer-mpci-mismatch-title"
      >
        <DialogTitle id="parent-issuer-mpci-mismatch-title">
          MPCI ID mismatch
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Carrier MPCI Code is "{parentIssuerMismatch?.carrierMpciCode}",
            but Parent BL Party MPCI ID is "
            {parentIssuerMismatch?.parentIssuerMpciId}". Do you want to
            continue with the Parent BL Party MPCI ID value?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetParentIssuerMpciId}>Use Carrier Value</Button>
          <Button variant="contained" onClick={keepParentIssuerMpciId}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default GeneralInfoTab;
