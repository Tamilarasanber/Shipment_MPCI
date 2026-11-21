import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Typography,
  Tooltip,
} from "@/components/ui/mui";
import { ExpandMoreIcon } from "@/components/ui/icons";
import { ExpandLessIcon } from "@/components/ui/icons";
import { AddIcon } from "@/components/ui/icons";
import ConfirmDeletePopover from "@/components/ui/ConfirmDeletePopover";
import ProgressButton from "@/components/ui/ProgressButton";
import { getIn, useFormikContext } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { fetchMpciMasterRequest } from "@/redux/actions/dubaiMpciAction";
import { initialHBLContainerValue } from "../../InitialValues/initialHBLContainerValue";
import FormikPreloadedAutocomplete from "@/components/ui/FormikPreloadedAutocomplete";
import {
  FormikMultiSelect,
  FormikSelect,
  FormikTextField,
} from "@/components/ui/FormikFields";
import SearchableAutocomplete from "@/components/ui/SearchableAutocomplete";
import {
  carrierSealTypeOptions,
  containerStatusOptions,
  customsSealTypeOptions,
  shipperSealTypeOptions,
  unitOptions,
} from "../../constants/selectOptions";
import {
  buildContainerHeaderIndex,
  buildContainerHeaderOptions,
  getContainerAutofillValue,
  getEmptyContainerAutofillValue,
} from "../../utils/containerHeaderUtils";

const ContainerDetailsTab = ({ hblIndex }) => {
  // console.log("ContainerDetailsTab re-render")
  const dispatch = useDispatch();
  const {
    packageTypeList,
    handlingInstructionList,
    containerCodeList,
    loading,
    error: masterError,
  } = useSelector((state) => state.DubaiFormFiling?.containerDetails || {});
  const reduxContainerHeaders = useSelector(
    (state) => state.DubaiFormFiling?.containerHeaderTemplates?.data || [],
  );

  // Dispatch for Master data
  const handleMasterSearch = useCallback(
    ({ type, section, targetField }) =>
      (text) => {
        if (!text || text.length < 2) return;

        dispatch(
          fetchMpciMasterRequest({
            type,
            searchText: text,
            section,
            targetField,
          }),
        );
      },
    [dispatch],
  );

  const handlePreloadOpen = useCallback(
    ({ type, section, targetField, options }) =>
      () => {
        if (loading || (Array.isArray(options) && options.length > 0)) return;

        dispatch(
          fetchMpciMasterRequest({
            type,
            section,
            targetField,
          }),
        );
      },
    [dispatch, loading],
  );

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    submitCount,
  } = useFormikContext();

  const formikContainers = values.hblList?.[hblIndex]?.containers || [];
  const isFurtherChildBLYes =
    values.hblList?.[hblIndex]?.generalInfo?.futureChildBl === "Yes";
  const formContainerHeaders = Array.isArray(values.containerHeaders)
    ? values.containerHeaders
    : [];
  const activeContainerHeaders = formContainerHeaders.length
    ? formContainerHeaders
    : reduxContainerHeaders;
  const containerHeaderOptions = useMemo(
    () => buildContainerHeaderOptions(activeContainerHeaders),
    [activeContainerHeaders],
  );
  const containerHeaderIndex = useMemo(
    () => buildContainerHeaderIndex(activeContainerHeaders),
    [activeContainerHeaders],
  );
  const initialHeaderAutofillRef = useRef({});
  const singleHeaderAutofill = useMemo(() => {
    if (activeContainerHeaders.length !== 1) return null;

    const header = activeContainerHeaders[0];
    const containerNo = String(header?.containerNoHeader ?? "").trim();
    if (!containerNo) return null;

    return {
      containerNo,
      values: getContainerAutofillValue(header, [containerNo]),
    };
  }, [activeContainerHeaders]);

  const handleAddContainer = useCallback(() => {
    const nextContainer = {
      ...initialHBLContainerValue(),
      ...(singleHeaderAutofill?.values || {}),
    };

    setFieldValue(`hblList.${hblIndex}.containers`, [
      ...formikContainers,
      nextContainer,
    ]);
  }, [formikContainers, hblIndex, setFieldValue, singleHeaderAutofill]);

  const hasError = (field) =>
    Boolean((getIn(touched, field) || submitCount > 0) && getIn(errors, field));

  const helperText = (field) =>
    getIn(touched, field) || submitCount > 0 ? getIn(errors, field) || "" : "";

  /* ---------- Delete Container ---------- */
  const handleDelete = (index) => {
    const updated = formikContainers.filter(
      (_, currentIndex) => currentIndex !== index,
    );
    setFieldValue(`hblList.${hblIndex}.containers`, updated);
  };

  /* ---------- Expand view more and view less ---------- */
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const [adding, setAdding] = useState(false);
  const handleAddContainerClick = async () => {
    try {
      setAdding(true);
      handleAddContainer();
    } finally {
      setAdding(false);
    }
  };

  const handleContainerHeaderSelection = useCallback(
    async (containerIndex, selectedContainerNos) => {
      const basePath = `hblList.${hblIndex}.containers.${containerIndex}`;
      const nextContainerNos = Array.isArray(selectedContainerNos)
        ? selectedContainerNos.slice(-1)
        : [];
      const selectedHeader =
        containerHeaderIndex[nextContainerNos[0]] || undefined;
      const autoFillValues = selectedHeader
        ? getContainerAutofillValue(selectedHeader, nextContainerNos)
        : getEmptyContainerAutofillValue();
      const currentContainer =
        values.hblList?.[hblIndex]?.containers?.[containerIndex] || {};

      await setFieldValue(
        basePath,
        {
          ...currentContainer,
          ...autoFillValues,
        },
        false,
      );

      await Promise.all([
        setFieldTouched(`${basePath}.containerNo`, true, false),
        validateField(`${basePath}.containerNo`),
      ]);

      await validateForm();
    },
    [
      containerHeaderIndex,
      hblIndex,
      setFieldTouched,
      setFieldValue,
      validateField,
      validateForm,
      values.hblList,
    ],
  );

  const handleReeferCargoToggle = useCallback(
    async (fieldPath, checked) => {
      const temperaturePath = `${fieldPath}.temperature`;
      const unitCodePath = `${fieldPath}.unitCode`;

      await setFieldValue(`${fieldPath}.reeferCargo`, checked, false);

      if (!checked) {
        await Promise.all([
          setFieldValue(temperaturePath, "", false),
          setFieldValue(unitCodePath, "", false),
          setFieldTouched(temperaturePath, false, false),
          setFieldTouched(unitCodePath, false, false),
        ]);
      } else {
        await Promise.all([
          setFieldTouched(temperaturePath, true, false),
          setFieldTouched(unitCodePath, true, false),
        ]);
      }

      await Promise.all([
        validateField(temperaturePath),
        validateField(unitCodePath),
      ]);

      await validateForm();
    },
    [setFieldTouched, setFieldValue, validateField, validateForm],
  );

  const handleDangerousGoodsToggle = useCallback(
    async (containerIndex, checked) => {
      const fieldPath = `hblList.${hblIndex}.containers.${containerIndex}`;
      const currentItems = values.hblList?.[hblIndex]?.items || [];

      await setFieldValue(`${fieldPath}.dangerousGoods`, checked, false);

      if (!checked) {
        await Promise.all(
          currentItems.flatMap((_, itemIndex) => [
            setFieldValue(
              `hblList.${hblIndex}.items.${itemIndex}.imoClass`,
              "",
              false,
            ),
            setFieldValue(
              `hblList.${hblIndex}.items.${itemIndex}.unCode`,
              "",
              false,
            ),
            setFieldTouched(
              `hblList.${hblIndex}.items.${itemIndex}.imoClass`,
              false,
              false,
            ),
            setFieldTouched(
              `hblList.${hblIndex}.items.${itemIndex}.unCode`,
              false,
              false,
            ),
          ]),
        );
      } else {
        await Promise.all(
          currentItems.flatMap((_, itemIndex) => [
            setFieldTouched(
              `hblList.${hblIndex}.items.${itemIndex}.imoClass`,
              true,
              false,
            ),
            setFieldTouched(
              `hblList.${hblIndex}.items.${itemIndex}.unCode`,
              true,
              false,
            ),
          ]),
        );
      }

      await validateForm();
    },
    [hblIndex, setFieldTouched, setFieldValue, validateForm, values.hblList],
  );

  useEffect(() => {
    let hasChanges = false;
    const nextContainers = formikContainers.map((container) => {
      const selectedContainerNo = Array.isArray(container?.containerNo)
        ? container.containerNo[0]
        : "";

      if (!selectedContainerNo) {
        return container;
      }

      const selectedHeader = containerHeaderIndex[selectedContainerNo];
      const autoFillValues = selectedHeader
        ? getContainerAutofillValue(selectedHeader, container.containerNo)
        : getEmptyContainerAutofillValue();
      const nextContainer = {
        ...container,
        ...autoFillValues,
      };

      const didChange =
        JSON.stringify(nextContainer) !== JSON.stringify(container);

      if (didChange) {
        hasChanges = true;
        return nextContainer;
      }

      return container;
    });

    if (hasChanges) {
      setFieldValue(`hblList.${hblIndex}.containers`, nextContainers, false);
    }
  }, [containerHeaderIndex, formikContainers, hblIndex, setFieldValue]);

  // Autoselect first container header for the first container if conditions are met
  useEffect(() => {
    const firstHeaderContainerNo = singleHeaderAutofill?.containerNo || "";
    const firstContainer = formikContainers[0];
    const currentContainerNo = Array.isArray(firstContainer?.containerNo)
      ? firstContainer.containerNo[0] || ""
      : "";
    const autofillKey = `${hblIndex}:${firstHeaderContainerNo}`;

    if (!firstHeaderContainerNo || !firstContainer || currentContainerNo) {
      return;
    }

    if (initialHeaderAutofillRef.current[autofillKey]) {
      return;
    }

    initialHeaderAutofillRef.current[autofillKey] = true;
    handleContainerHeaderSelection(0, [firstHeaderContainerNo]);
  }, [
    formikContainers,
    handleContainerHeaderSelection,
    hblIndex,
    singleHeaderAutofill,
  ]);

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {formikContainers.map((container, index) => {
          const fieldPath = `hblList.${hblIndex}.containers.${index}`;
          const customsSealError = getIn(errors, `${fieldPath}.sealGroup`);
          const isSealingPartyRequired = Boolean(
            String(container?.customsSeal ?? "").trim(),
          );

          return (
            <Paper key={container.id || index} variant="outlined" sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography fontWeight={600}>Container {index + 1}</Typography>

                {formikContainers.length > 1 && (
                  <ConfirmDeletePopover
                    title="Delete Container"
                    message="Are you sure you want to delete this container?"
                    onConfirm={() => handleDelete(index)}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* 1st order field */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <SearchableAutocomplete
                    name={`hblList.${hblIndex}.containers.${index}.containerCode`}
                    label="Container Code"
                    value={container.containerCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={containerCodeList}
                    loading={loading}
                    onSearch={handleMasterSearch({
                      type: "CONTAINER",
                      section: "containerDetails",
                      targetField: "containerCodeList",
                    })}
                    getOptionLabelKey="containerCode"
                    getOptionValueKey="containerCode"
                    additionalFieldMappings={{ containerId: "id" }}
                    required={!isFurtherChildBLYes}
                    error={hasError(
                      `hblList.${hblIndex}.containers.${index}.containerCode`,
                    )}
                    helperText={helperText(
                      `hblList.${hblIndex}.containers.${index}.containerCode`,
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikMultiSelect
                    name={`hblList.${hblIndex}.containers.${index}.containerNo`}
                    label="Container No"
                    options={containerHeaderOptions}
                    required
                    maxSelections={1}
                    allowSelectAll={false}
                    onValueChange={(nextValue) =>
                      handleContainerHeaderSelection(index, nextValue)
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikSelect
                    name={`hblList.${hblIndex}.containers.${index}.containerStatus`}
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
                    name={`hblList.${hblIndex}.containers.${index}.shipperSeal`}
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
                    name={`hblList.${hblIndex}.containers.${index}.shipperSealType`}
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
                    name={`hblList.${hblIndex}.containers.${index}.carrierSeal`}
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

                {/* Carrier Seal Type */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikSelect
                    name={`hblList.${hblIndex}.containers.${index}.carrierSealType`}
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

                {/* Customs Seal */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikTextField
                    name={`hblList.${hblIndex}.containers.${index}.customsSeal`}
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

                {/* Customs Seal Type */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikSelect
                    name={`hblList.${hblIndex}.containers.${index}.customsSealType`}
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

                {/* Sealing Party Name  */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikTextField
                    name={`hblList.${hblIndex}.containers.${index}.sealingPartyName`}
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

                {/* View More / Less */}
                <Grid
                  container
                  spacing={2.5}
                  size={{ xs: 12 }}
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => toggleExpand(index)}
                      endIcon={
                        expandedItems[index] ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )
                      }
                      sx={{ textTransform: "none" }}
                    >
                      {expandedItems[index] ? "View Less" : "View More"}
                    </Button>
                  </Box>
                </Grid>

                {/* 2nd order field */}
                {expandedItems[index] && (
                  <Grid
                    container
                    spacing={2.5}
                    size={{ xs: 12 }}
                    sx={{ mb: 2 }}
                  >
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormikPreloadedAutocomplete
                        name={`hblList.${hblIndex}.containers.${index}.packageTypeName`}
                        label="Package Type"
                        options={packageTypeList}
                        loading={loading}
                        loadError={masterError}
                        onDropdownOpen={handlePreloadOpen({
                          type: "PACKAGE_TYPE",
                          section: "containerDetails",
                          targetField: "packageTypeList",
                          options: packageTypeList,
                        })}
                        getOptionLabelKey="name"
                        getOptionValueKey="name"
                        additionalFieldMappings={{ packageTypeId: "id" }}
                        getOptionDisplayLabel={(option) =>
                          option?.displayLabel ||
                          option?.note ||
                          option?.name ||
                          ""
                        }
                      />
                    </Grid>

                    {/* Handling Instruction */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormikPreloadedAutocomplete
                        name={`hblList.${hblIndex}.containers.${index}.handlingInstructionName`}
                        label="Handling Instruction"
                        options={handlingInstructionList}
                        loading={loading}
                        loadError={masterError}
                        onDropdownOpen={handlePreloadOpen({
                          type: "HANDLINGINSTRUCTION",
                          section: "containerDetails",
                          targetField: "handlingInstructionList",
                          options: handlingInstructionList,
                        })}
                        getOptionLabelKey="name"
                        getOptionValueKey="name"
                        additionalFieldMappings={{
                          handlingInstructionId: "id",
                        }}
                      />
                    </Grid>

                    {/* VGM Weight (KGM) */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Tooltip title="Example: 99999999999999.999 (numbers with up to 3 decimal places)">
                        <FormikTextField
                          name={`hblList.${hblIndex}.containers.${index}.weight`}
                          label="VGM Weight (KGM)"
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </Tooltip>
                    </Grid>
                    {/* Number of packages */}
                    {/* <Grid>
                        <FormikTextField
                          name={`hblList.${hblIndex}.containers.${index}.numberOfPackages`}
                          label="No. Packages"
                          type="number"
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </Grid> */}

                    {/* Remove Container Split Filing */}
                    {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormikSelect
                          name={`hblList.${hblIndex}.containers.${index}.removeContainerSplit`}
                          label="Remove Container Split Filing"
                          options={splitFilingOptions}
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </Grid> */}

                    {/* {splitFilingValue === "Yes" && (
                        <>
                         

                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormikTextField
                              name={`hblList.${hblIndex}.containers.${index}.newSplitBlNumber`}
                              label="New Split BL Number"
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
                              name={`hblList.${hblIndex}.containers.${index}.newParentBlNumber`}
                              label="New Parent BL Number"
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
                              name={`hblList.${hblIndex}.containers.${index}.newVesselName`}
                              label="New Vessel Name"
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
                              name={`hblList.${hblIndex}.containers.${index}.newVoyageNumber`}
                              label="New Voyage Number"
                              formik={{
                                values,
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                              }}
                            />
                          </Grid>
                        </>
                      )} */}
                  </Grid>
                )}
              </Grid>

              <Grid container spacing={2.5} size={{ xs: 12 }}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(container.reeferCargo)}
                          onChange={(event) =>
                            handleReeferCargoToggle(
                              fieldPath,
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="Reefer Cargo"
                    />

                    {/* Temperature */}
                    {container.reeferCargo && (
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <FormikTextField
                          name={`hblList.${hblIndex}.containers.${index}.temperature`}
                          label="Temperature (deg C)"
                          type="number"
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

                    {/* Unit Code */}
                    {container.reeferCargo && (
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <FormikSelect
                          name={`hblList.${hblIndex}.containers.${index}.unitCode`}
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
                  <Box sx={{ display: "flex", gap: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(container.dangerousGoods)}
                          onChange={(event) =>
                            handleDangerousGoodsToggle(
                              index,
                              event.target.checked,
                            )
                          }
                        />
                      }
                      label="Dangerous Goods (DG)"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Box>

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
    </Box>
  );
};

export default ContainerDetailsTab;
