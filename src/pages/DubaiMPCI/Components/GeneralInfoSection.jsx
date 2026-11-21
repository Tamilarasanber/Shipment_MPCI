import React, { memo, useCallback, useEffect, useMemo } from "react";
import { Grid } from "@/components/ui/mui";
import { connect } from "formik";
import {
  FormikTextField,
  FormikSelect,
} from "@/components/ui/FormikFields";
import SearchableAutocomplete from "@/components/ui/SearchableAutocomplete";
import {
  actionCodeOptions,
  filingTypeOptions,
} from "../constants/selectOptions";
import FormikPreloadedAutocomplete from "@/components/ui/FormikPreloadedAutocomplete";
import { useDispatch, useSelector } from "react-redux";
import { fetchMpciMasterRequest } from "@/redux/actions/dubaiMpciAction";
import {
  getEfsAgentCodes,
  getShipmentSourceRole,
  isUaeMpciCustomerRole,
} from "../utils/loginUserDataUtils";
import { formatEfsAgentDisplayLabel } from "../MapperLayer/DubaiMPCIMasterFormatters";

const GeneralInfoSection = ({ formik }) => {
  const dispatch = useDispatch();
  const {
    values,
    setFieldValue,
    handleChange,
    handleBlur,
    errors,
    touched,
    submitCount,
  } = formik;
  const {
    efsAgentList = [],
    loading,
    error: masterError,
  } = useSelector((state) => state.DubaiFormFiling?.generalInfoDetails || {});

  const { loginUserData } = useSelector((state) => state.Login);
  const hideOriginAgent = isUaeMpciCustomerRole(loginUserData);
  const efsAgentCodes = useMemo(
    () => getEfsAgentCodes(loginUserData),
    [loginUserData?.efsAgentCodes],
  );
  const showAssignedEfsAgent = efsAgentCodes.length > 0;
  const agentRole = useMemo(
    () => getShipmentSourceRole(loginUserData),
    [loginUserData?.shipmentSource],
  );
  const efsAgentFilter = useMemo(
    () => efsAgentCodes.join(","),
    [efsAgentCodes],
  );

  const handleAgentSearch = useCallback(
    (searchText) => {
      const filter = String(searchText ?? "").trim();
      if (!filter) return;

      dispatch(
        fetchMpciMasterRequest({
          type: "EFSAGENTNAME",
          section: "generalInfoDetails",
          targetField: "efsAgentList",
          role: agentRole,
          filter,
        }),
      );
    },
    [agentRole, dispatch],
  );
  const handleEfsAgentDropdownOpen = useCallback(() => {
    if (loading || efsAgentList.length > 0 || !efsAgentFilter) return;

    dispatch(
      fetchMpciMasterRequest({
        type: "EFSAGENTNAME",
        section: "generalInfoDetails",
        targetField: "efsAgentList",
        role: agentRole,
        filter: efsAgentFilter,
      }),
    );
  }, [agentRole, dispatch, efsAgentFilter, efsAgentList.length, loading]);
  useEffect(() => {
    const nextCount = values.hblList?.length || 0;
    if (values.noOfHBLs !== nextCount) {
      setFieldValue("noOfHBLs", nextCount, false);
    }
  }, [values.hblList?.length, values.noOfHBLs, setFieldValue]);

  return (
    <Grid container spacing={3}>
      {/* Action Code */}

      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormikSelect
          name="actionCode"
          label="Action"
          options={actionCodeOptions}
          formik={formik}
          required
        />
      </Grid>

      {/* Filing for */}

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <FormikTextField
          name="filingfor"
          label="Filing for"
          formik={formik}
          disabled
          required
        />
      </Grid>

      {/* Filing Type */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormikSelect
          name="filingType"
          label="Filing Type"
          options={filingTypeOptions}
          formik={formik}
          required
        />
      </Grid>

      {/* No of HBLs */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormikTextField
          name="noOfHBLs"
          label="No. of HBLs"
          formik={formik}
          required
          disabled
          placeholder="Auto-calculated"
        />
      </Grid>
      {!hideOriginAgent &&
        (showAssignedEfsAgent ? (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormikPreloadedAutocomplete
              name="efsAgentNameField"
              label="Origin Agent"
              options={efsAgentList}
              loading={loading}
              loadError={masterError}
              onDropdownOpen={handleEfsAgentDropdownOpen}
              required
              getOptionLabelKey="agentName"
              getOptionValueKey="agentName"
              additionalFieldMappings={{ efsAgentCodeField: "agentCode" }}
              getOptionDisplayLabel={(option) =>
                option?.displayLabel || option?.agentName || ""
              }
            />
          </Grid>
        ) : (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SearchableAutocomplete
              name="efsAgentNameField"
              label="Origin Agent"
              value={values.efsAgentNameField}
              onChange={handleChange}
              onBlur={handleBlur}
              options={efsAgentList}
              loading={loading}
              required
              error={Boolean(
                (touched.efsAgentNameField || submitCount > 0) &&
                errors.efsAgentNameField,
              )}
              helperText={
                (touched.efsAgentNameField || submitCount > 0) &&
                errors.efsAgentNameField
                  ? errors.efsAgentNameField
                  : masterError || ""
              }
              onSearch={handleAgentSearch}
              getOptionLabelKey="agentName"
              getOptionValueKey="agentName"
              additionalFieldMappings={{ efsAgentCodeField: "agentCode" }}
              getOptionDisplayLabel={(option) =>
                option?.displayLabel || formatEfsAgentDisplayLabel(option)
              }
            />
          </Grid>
        ))}
    </Grid>
  );
};

const areEqual = (prevProps, nextProps) => {
  const prev = prevProps.formik || {};
  const next = nextProps.formik || {};

  return (
    prev.values?.actionCode === next.values?.actionCode &&
    prev.values?.filingfor === next.values?.filingfor &&
    prev.values?.filingType === next.values?.filingType &&
    prev.values?.noOfHBLs === next.values?.noOfHBLs &&
    prev.values?.efsAgentNameField === next.values?.efsAgentNameField &&
    prev.values?.efsAgentCodeField === next.values?.efsAgentCodeField &&
    (prev.values?.hblList?.length || 0) ===
      (next.values?.hblList?.length || 0) &&
    prev.errors?.actionCode === next.errors?.actionCode &&
    prev.errors?.filingfor === next.errors?.filingfor &&
    prev.errors?.filingType === next.errors?.filingType &&
    prev.errors?.efsAgentNameField === next.errors?.efsAgentNameField &&
    prev.touched?.actionCode === next.touched?.actionCode &&
    prev.touched?.filingfor === next.touched?.filingfor &&
    prev.touched?.filingType === next.touched?.filingType &&
    prev.touched?.efsAgentNameField === next.touched?.efsAgentNameField &&
    prev.submitCount === next.submitCount
  );
};

export default connect(memo(GeneralInfoSection, areEqual));
