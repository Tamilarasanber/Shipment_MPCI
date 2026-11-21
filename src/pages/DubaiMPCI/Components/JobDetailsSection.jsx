import { useState, memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Typography,
} from "@/components/ui/mui";
import { AddIcon } from "@/components/ui/icons";
import { connect, getIn } from "formik";
import {
  FormikDatePicker,
  FormikSelect,
  FormikTextField,
} from "@/components/ui/FormikFields";
import ConfirmDeletePopover from "@/components/ui/ConfirmDeletePopover";
import ProgressButton from "@/components/ui/ProgressButton";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMpciMasterRequest,
  saveMpciContainerHeadersRequest,
} from "@/redux/actions/dubaiMpciAction";
import { useMpciRules } from "../hooks/useMpciRules";
import { isVisible } from "../utils/mpciFieldUtils";
import {
  cargoTypeOptions,
  carrierSealTypeOptions,
  containerStatusOptions,
  customsSealTypeOptions,
  shipperSealTypeOptions,
  unitOptions,
} from "../constants/selectOptions";
import SearchableAutocomplete from "@/components/ui/SearchableAutocomplete";
import CountryFlag from "@/components/ui/CountryFlag";
import { SlAnchor } from "@/components/ui/icons";
import { initialContainerHeaderValue } from "../InitialValues/initialContainerHeaderValue";
import FormikVesselLookupAutocomplete from "./inputs/FormikVesselLookupAutocomplete";
import { isUaeMpciCustomerRole } from "../utils/loginUserDataUtils";
import { PORT_TRANSPORT_MODE_OCEAN } from "../constants/portTransportMode";

const textFieldSx = {
  "& .MuiInputBase-root": { height: 40 },
};

const buildContainerHeaderBasePath = (index) => `containerHeaders.${index}`;

const JobDetailsSection = ({ formik }) => {
  const dispatch = useDispatch();
  //  console.log("Job details re-render")
  // const { loading, carrierList, vesselList, countryList } = useSelector(
  //   (state) => state.DubaiFormFiling,
  // );
  // const { portFieldList, portLoading } = useSelector(
  //   (state) => state.SailingSchedule,
  // );
  const {
    carrierList,
    firstPortOfLoadingList,
    lastForeignPortList,
    portOfDischargeList,
    vesselCountryList,
    loading,
  } = useSelector((state) => state.DubaiFormFiling?.jobDetails || {});
  const { containerCodeList, loading: containerMasterLoading } = useSelector(
    (state) => state.DubaiFormFiling?.containerDetails || {},
  );
  const { loginUserData } = useSelector((state) => state.Login);
  const disableMpciPartyIds = isUaeMpciCustomerRole(loginUserData);

  const headerSyncRef = useRef("");

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

  const {
    values,
    handleChange,
    handleBlur,
    setFieldValue,
    errors,
    touched,
    submitCount,
    validateForm,
  } = formik;

  const containerHeaders = Array.isArray(values.containerHeaders)
    ? values.containerHeaders
    : [];

  useEffect(() => {
    const serializedHeaders = JSON.stringify(containerHeaders);
    if (serializedHeaders === headerSyncRef.current) {
      return;
    }

    headerSyncRef.current = serializedHeaders;
    dispatch(saveMpciContainerHeadersRequest({ headers: containerHeaders }));
  }, [containerHeaders, dispatch]);

  const hasError = (field) =>
    Boolean((getIn(touched, field) || submitCount > 0) && getIn(errors, field));
  const helperText = (field) =>
    getIn(touched, field) || submitCount > 0 ? getIn(errors, field) || "" : "";

  // port flag and portname and portcode
  const renderPortOption = (props, option) => {
    const { key, ...rest } = props;

    return (
      <Box
        key={key}
        component="li"
        {...rest}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <CountryFlag
          countryCode={option.portCountry}
          className="port-flag input-port-flag"
        />

        <Box ml={1} flexGrow={1}>
          <div style={{ fontWeight: 500, fontSize: 13 }}>
            {option.displayLabel || `${option.portName} (${option.portCode})`}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {option.portCountry}
          </div>
        </Box>

        <SlAnchor size={18} />
      </Box>
    );
  };

  const renderCountryOption = (props, option) => {
    const { key, ...rest } = props;

    return (
      <Box
        key={key}
        component="li"
        {...rest}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <CountryFlag
          countryCode={option.countryCode || option.currencyCode}
          className="port-flag input-port-flag"
        />

        <Box ml={1} flexGrow={1}>
          <div style={{ fontWeight: 500, fontSize: 13 }}>
            {option.displayLabel ||
              `${option.countryName} (${option.countryCode || option.currencyCode})`}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {option.countryCode || option.currencyCode}
          </div>
        </Box>
      </Box>
    );
  };
  // condtional rendering based on rules
  const rulesInput = useMemo(
    () => ({
      filingfor: values.filingfor,
      filingType: values.filingType,
      actionCode: values.actionCode,
    }),
    [values.filingfor, values.filingType, values.actionCode],
  );
  const rules = useMpciRules(rulesInput, "JobDetailsSection");

  const handleAddContainerHeader = useCallback(() => {
    setFieldValue("containerHeaders", [
      ...containerHeaders,
      initialContainerHeaderValue(),
    ]);
  }, [containerHeaders, setFieldValue]);

  const handleDeleteContainerHeader = useCallback(
    (index) => {
      setFieldValue(
        "containerHeaders",
        containerHeaders.filter((_, currentIndex) => currentIndex !== index),
      );
    },
    [containerHeaders, setFieldValue],
  );

  const handleHeaderReeferCargoToggle = useCallback(
    async (index, checked) => {
      const basePath = buildContainerHeaderBasePath(index);

      await setFieldValue(`${basePath}.reeferCargoHeader`, checked, false);
      await validateForm();
    },
    [setFieldValue, validateForm],
  );

  const [adding, setAdding] = useState(false);
  const handleAddContainerClick = async () => {
    try {
      setAdding(true);
      handleAddContainerHeader();
    } finally {
      setAdding(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SearchableAutocomplete
          name="carrierName"
          label="Carrier"
          value={values.carrierName}
          onChange={handleChange}
          onBlur={handleBlur}
          options={carrierList}
          loading={loading}
          onSearch={handleMasterSearch({
            type: "CARRIER",
            section: "jobDetails",
            targetField: "carrierList",
          })}
          getOptionLabelKey="carrierName"
          getOptionValueKey="carrierName"
          additionalFieldMappings={{
            carrierId: "id",
            carrierCode: "carrierCode",
            carrierMpciCode: "carrierMpciCode",
          }}
          required
          error={hasError("carrierName")}
          helperText={helperText("carrierName")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikTextField
          name="mblNo"
          label="MBL Number"
          formik={{ values, errors, touched, handleChange, handleBlur }}
          trimSpaces
          required
          sx={textFieldSx}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikSelect
          name="cargoType"
          label="Cargo Type"
          options={cargoTypeOptions}
          required
          formik={{ values, errors, touched, handleChange, handleBlur }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikDatePicker
          name="etd"
          label="ETD"
          formik={{ values, errors, touched, setFieldValue }}
          sx={{ "& .MuiInputBase-root": { height: 40 } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikDatePicker
          name="eta"
          label="ETA"
          required
          formik={{ values, errors, touched, setFieldValue }}
          sx={{ "& .MuiInputBase-root": { height: 40 } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SearchableAutocomplete
          name="firstPortLoadingName"
          label="First Port of Loading"
          value={values.firstPortLoadingName}
          onChange={handleChange}
          onBlur={handleBlur}
          options={firstPortOfLoadingList}
          loading={loading}
          onSearch={handleMasterSearch({
            type: "PORTNAME",
            section: "jobDetails",
            targetField: "firstPortOfLoadingList",
            transportMode: PORT_TRANSPORT_MODE_OCEAN,
          })}
          getOptionLabelKey="portName"
          getOptionValueKey="portName"
          additionalFieldMappings={{ firstPortLoadingId: "id" }}
          renderCustomOption={renderPortOption}
          required
          error={hasError("firstPortLoadingName")}
          helperText={helperText("firstPortLoadingName")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SearchableAutocomplete
          name="lastForeignPortName"
          label="Last Foreign Port"
          value={values.lastForeignPortName}
          onChange={handleChange}
          onBlur={handleBlur}
          options={lastForeignPortList}
          loading={loading}
          onSearch={handleMasterSearch({
            type: "PORTNAME",
            section: "jobDetails",
            targetField: "lastForeignPortList",
            transportMode: PORT_TRANSPORT_MODE_OCEAN,
          })}
          getOptionLabelKey="portName"
          getOptionValueKey="portName"
          additionalFieldMappings={{ lastForeignPortId: "id" }}
          renderCustomOption={renderPortOption}
          required
          error={hasError("lastForeignPortName")}
          helperText={helperText("lastForeignPortName")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SearchableAutocomplete
          name="portOfDischargeName"
          label="Port of Discharge"
          value={values.portOfDischargeName}
          onChange={handleChange}
          onBlur={handleBlur}
          options={portOfDischargeList}
          loading={loading}
          onSearch={handleMasterSearch({
            type: "PORTNAME",
            section: "jobDetails",
            targetField: "portOfDischargeList",
            transportMode: PORT_TRANSPORT_MODE_OCEAN,
          })}
          getOptionLabelKey="portName"
          getOptionValueKey="portName"
          additionalFieldMappings={{ portOfDischargeId: "id" }}
          renderCustomOption={renderPortOption}
          required
          error={hasError("portOfDischargeName")}
          helperText={helperText("portOfDischargeName")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikVesselLookupAutocomplete
          name="vesselName"
          label="Vessel Name"
          required
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikTextField
          name="voyageNo"
          label="Voyage Number"
          formik={{ values, errors, touched, handleChange, handleBlur }}
          trimSpaces
          required
          sx={textFieldSx}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SearchableAutocomplete
          name="vesselCountryName"
          label="Vessel Country"
          value={values.vesselCountryName}
          onChange={handleChange}
          onBlur={handleBlur}
          options={vesselCountryList}
          loading={loading}
          onSearch={handleMasterSearch({
            type: "COUNTRY",
            section: "jobDetails",
            targetField: "vesselCountryList",
          })}
          getOptionLabelKey="countryName"
          getOptionValueKey="countryName"
          additionalFieldMappings={{
            vesselCountryId: "id",
            vesselCountryCode: "countryCode",
          }}
          renderCustomOption={renderCountryOption}
          required
          error={hasError("vesselCountryName")}
          helperText={helperText("vesselCountryName")}
        />
      </Grid>

      {isVisible("filingPartyMpciID", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextField
            name="filingPartyMpciID"
            label="Filing Party MPCI ID"
            formik={{ values, errors, touched, handleChange, handleBlur }}
            disabled={disableMpciPartyIds}
            trimSpaces
            required
            sx={textFieldSx}
          />
        </Grid>
      )}

      {isVisible("liablePartyMpciId", rules) && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormikTextField
            name="liablePartyMpciId"
            label="Liable UAE Party MPCI ID"
            formik={{ values, errors, touched, handleChange, handleBlur }}
            disabled={disableMpciPartyIds}
            trimSpaces
            required
            sx={textFieldSx}
          />
        </Grid>
      )}

      {/* Container Header field */}
      {/* <Grid size={{ xs: 12 }}>
        <Divider sx={{ my: 1 }} />
      </Grid> */}

      <Grid size={{ xs: 12 }}>
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Container Headers
          </Typography>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddContainerHeader}
          >
            Add Container
          </Button>
        </Box> */}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {containerHeaders.map((containerHeader, index) => {
            const basePath = buildContainerHeaderBasePath(index);
            const customsSealError = getIn(errors, `${basePath}.sealGroup`);
            const isSealingPartyRequired = Boolean(
              String(containerHeader?.customsSealHeader ?? "").trim(),
            );

            return (
              <Paper
                key={containerHeader?.id || index}
                variant="outlined"
                sx={{ p: 3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography fontWeight={600}>
                    Container {index + 1}
                  </Typography>

                  {containerHeaders.length > 1 && (
                    <ConfirmDeletePopover
                      title="Delete Container"
                      message="Are you sure you want to delete this container ?"
                      onConfirm={() => handleDeleteContainerHeader(index)}
                    />
                  )}
                </Box>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SearchableAutocomplete
                      name={`${basePath}.containerCodeHeader`}
                      label="Container Code"
                      value={containerHeader?.containerCodeHeader || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      options={containerCodeList}
                      loading={containerMasterLoading}
                      onSearch={handleMasterSearch({
                        type: "CONTAINER",
                        section: "containerDetails",
                        targetField: "containerCodeList",
                      })}
                      getOptionLabelKey="containerCode"
                      getOptionValueKey="containerCode"
                      additionalFieldMappings={{ containerIdHeader: "id" }}
                      required
                      error={hasError(`${basePath}.containerCodeHeader`)}
                      helperText={helperText(`${basePath}.containerCodeHeader`)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikTextField
                      name={`${basePath}.containerNoHeader`}
                      label="Container No"
                      required
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikSelect
                      name={`${basePath}.containerStatusHeader`}
                      label="Container Status"
                      options={containerStatusOptions}
                      required
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikTextField
                      name={`${basePath}.shipperSealHeader`}
                      label="Shipper Seal"
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikSelect
                      name={`${basePath}.shipperSealTypeHeader`}
                      label="Shipper Seal Type"
                      options={shipperSealTypeOptions}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikTextField
                      name={`${basePath}.carrierSealHeader`}
                      label="Carrier Seal"
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikSelect
                      name={`${basePath}.carrierSealTypeHeader`}
                      label="Carrier Seal Type"
                      options={carrierSealTypeOptions}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikTextField
                      name={`${basePath}.customsSealHeader`}
                      label="Customs Seal"
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikSelect
                      name={`${basePath}.customsSealTypeHeader`}
                      label="Customs Seal Type"
                      options={customsSealTypeOptions}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikTextField
                      name={`${basePath}.sealingPartyNameHeader`}
                      label="Sealing Party Name"
                      required={isSealingPartyRequired}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </Grid>

                  {customsSealError && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        sx={{
                          color: "error.main",
                          fontSize: "0.75rem",
                          mt: 1,
                        }}
                      >
                        {customsSealError}
                      </Typography>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(
                              containerHeader?.reeferCargoHeader,
                            )}
                            onChange={(event) =>
                              handleHeaderReeferCargoToggle(
                                index,
                                event.target.checked,
                              )
                            }
                          />
                        }
                        label="Reefer Cargo"
                      />

                      {containerHeader?.reeferCargoHeader && (
                        <Grid size={{ xs: 12, sm: 2.5 }}>
                          <FormikTextField
                            name={`${basePath}.temperatureHeader`}
                            label="Temperature (deg C)"
                            required
                            formik={{
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                            }}
                          />
                        </Grid>
                      )}

                      {containerHeader?.reeferCargoHeader && (
                        <Grid size={{ xs: 12, sm: 2.5 }}>
                          <FormikSelect
                            name={`${basePath}.unitCodeHeader`}
                            label="Unit Code"
                            options={unitOptions}
                            required
                            formik={{
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                            }}
                          />
                        </Grid>
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(
                            containerHeader?.dangerousGoodsHeader,
                          )}
                          onChange={(event) =>
                            setFieldValue(
                              `${basePath}.dangerousGoodsHeader`,
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="Dangerous Goods (DG)"
                    />
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>
        {/* <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        
      </Box> */}
        {/* <Box>
          <Grid container justifyContent="flex-end">
            <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddContainerHeader}
          >
            Add Container
          </Button>
          </Grid>
        </Box> */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <ProgressButton
            label="Add Container"
            loadingStatus={adding}
            onClick={handleAddContainerClick}
            icon={<AddIcon style={{ marginRight: 6 }} />}
            autoWidth
            color="#fff"
          />
        </Box>
      </Grid>
    </Grid>
  );
};

const areEqual = (prevProps, nextProps) => {
  const prev = prevProps.formik || {};
  const next = nextProps.formik || {};
  const prevValues = prev.values || {};
  const nextValues = next.values || {};
  const prevErrors = prev.errors || {};
  const nextErrors = next.errors || {};
  const prevTouched = prev.touched || {};
  const nextTouched = next.touched || {};

  const watchedFields = [
    "actionCode",
    "filingfor",
    "filingType",
    "carrierName",
    "mblNo",
    "cargoType",
    "etd",
    "eta",
    "firstPortLoadingName",
    "lastForeignPortName",
    "portOfDischargeName",
    "vesselName",
    "voyageNo",
    "vesselCountryName",
    "filingPartyMpciID",
    "liablePartyMpciId",
    "containerHeaders",
  ];

  for (const field of watchedFields) {
    if (prevValues[field] !== nextValues[field]) return false;
    if (prevErrors[field] !== nextErrors[field]) return false;
    if (prevTouched[field] !== nextTouched[field]) return false;
  }

  return prev.submitCount === next.submitCount;
};

export default connect(memo(JobDetailsSection, areEqual));
