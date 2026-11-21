import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  Tooltip,
} from "@/components/ui/mui";
import { ExpandMoreIcon } from "@/components/ui/icons";
import { ExpandLessIcon } from "@/components/ui/icons";
import { AddIcon } from "@/components/ui/icons";
import ConfirmDeletePopover from "@/components/ui/ConfirmDeletePopover";
import { getIn, useFormikContext } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { fetchMpciMasterRequest } from "@/redux/actions/dubaiMpciAction";
// import { removedItemOptions } from "../../constants/selectOptions";
import { FormikTextFieldWithPopup } from "@/components/ui/FormikFields";
import { initialHBLItemValue } from "../../InitialValues/initialHBLItemValue";
import FormikPreloadedAutocomplete from "@/components/ui/FormikPreloadedAutocomplete";
import SearchableAutocomplete from "@/components/ui/SearchableAutocomplete";
import SearchableMultiAutocomplete from "@/components/ui/SearchableMultiAutocomplete";
import { FormikMultiSelect } from "@/components/ui/FormikFields";
import { normalizeContainerNumberList } from "../../utils/containerHeaderUtils";
import ProgressButton from "@/components/ui/ProgressButton";
import { imoClassOptions } from "../../constants/selectOptions";

import {
  FormikTextField,
  FormikSelect,
} from "@/components/ui/FormikFields";

/* ---------------- COMPONENT ---------------- */

const ItemDetailsTab = ({ hblIndex }) => {
  //  console.log("items re-render")
  // const { themeDetails } = useSelector((state) => state.Theme);
  // console.log(JSON.stringify(items, null, 2));
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setValues,
    submitCount,
  } = useFormikContext();
  const formikItems = values.hblList?.[hblIndex]?.items || [];

  const dispatch = useDispatch();

  const {
    hsCodeList,
    packageTypeList,
    markingInstructionList,
    packingDescCodeList,
    itemCountryList,
    loading,
    error: masterError,
  } = useSelector((state) => state.DubaiFormFiling?.itemDetails || {});

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

  /* ---------- Delete Item ---------- */
  const handleDelete = (index) => {
    const updated = formikItems.filter((_, i) => i !== index);
    setFieldValue(`hblList.${hblIndex}.items`, updated);
  };

  /* ---------- Expand view more and view less ---------- */

  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const hasError = (field) =>
    Boolean((getIn(touched, field) || submitCount > 0) && getIn(errors, field));

  const helperText = (field) =>
    getIn(touched, field) || submitCount > 0 ? getIn(errors, field) || "" : "";

  const containers = values.hblList?.[hblIndex]?.containers || [];
  // Items can only be assigned to containers selected in Container Details.
  // Set preserves the container order and prevents duplicate options.
  const containerOptions = useMemo(() => {
    const selectedContainerNos = new Set();

    containers.forEach((container) => {
      normalizeContainerNumberList(container?.containerNo).forEach(
        (containerNo) => selectedContainerNos.add(containerNo),
      );
    });

    return Array.from(selectedContainerNos, (containerNo) => ({
      label: containerNo,
      value: containerNo,
    }));
  }, [containers]);
  const dangerousContainerNoSet = useMemo(() => {
    const dangerousContainerNos = new Set();

    containers.forEach((container) => {
      if (!container?.dangerousGoods) return;

      normalizeContainerNumberList(container.containerNo).forEach(
        (containerNo) => dangerousContainerNos.add(containerNo),
      );
    });

    return dangerousContainerNos;
  }, [containers]);
  const singleContainerNo =
    containerOptions.length === 1
      ? String(containerOptions[0]?.value ?? "").trim()
      : "";
  const hasSingleContainerOption = Boolean(singleContainerNo);

  const hsCodeSearch = useMemo(
    () =>
      handleMasterSearch({
        type: "HS_CODE",
        section: "itemDetails",
        targetField: "hsCodeList",
      }),
    [handleMasterSearch],
  );

  const isHsCodeRequired =
    values.hblList?.[hblIndex]?.generalInfo?.futureChildBl !== "Yes";
  const validImoClassValues = useMemo(
    () => new Set(imoClassOptions.map((option) => String(option.value))),
    [],
  );
  const handleAddItem = useCallback(() => {
    const nextItem = {
      ...initialHBLItemValue(),
      containerNo: singleContainerNo ? [singleContainerNo] : [],
    };

    setFieldValue(`hblList.${hblIndex}.items`, [...formikItems, nextItem]);
  }, [formikItems, hblIndex, setFieldValue, singleContainerNo]);

  useEffect(() => {
    setValues((prev) => {
      const prevHblList = prev?.hblList || [];
      const currentHbl = prevHblList[hblIndex];
      if (!currentHbl) return prev;

      const prevItems = currentHbl.items || [];
      let hasChanges = false;

      const nextItems = prevItems.map((currentItem) => {
        const imoClassValue = String(currentItem?.imoClass ?? "").trim();
        if (!imoClassValue || validImoClassValues.has(imoClassValue)) {
          return currentItem;
        }

        hasChanges = true;
        return { ...currentItem, imoClass: "" };
      });

      if (!hasChanges) return prev;

      const nextHblList = [...prevHblList];
      nextHblList[hblIndex] = {
        ...currentHbl,
        items: nextItems,
      };

      return {
        ...prev,
        hblList: nextHblList,
      };
    }, false);
  }, [hblIndex, setValues, validImoClassValues]);

  const [addingItem, setAddingItem] = useState(false);
  const handleAddItemClick = async () => {
    try {
      setAddingItem(true);
      handleAddItem();
    } finally {
      setAddingItem(false);
    }
  };

  const getHsCodeList = (item) => {
    return String(item?.hsCode ?? "")
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean);
  };

  const formatHsCodeSummary = (item, limit = 5) => {
    const hsCodes = getHsCodeList(item);
    if (!hsCodes.length) return "";
    const shown = hsCodes.slice(0, limit).join(", ");
    return hsCodes.length > limit ? `${shown} ...` : shown;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {formikItems.map((item, index) => {
          const itemHasDangerousGoods = normalizeContainerNumberList(
            item?.containerNo,
          ).some((containerNo) => dangerousContainerNoSet.has(containerNo));

          return (
            <Paper key={item.id || index} variant="outlined" sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography fontWeight={600}>
                  Item Details - {formatHsCodeSummary(item)} |{" "}
                  {Array.isArray(item.containerNo)
                    ? item.containerNo.join(", ")
                    : item.containerNo || ""}
                </Typography>

                {formikItems.length > 1 && (
                  <ConfirmDeletePopover
                    title="Delete Item"
                    message="Are you sure you want to delete this item?"
                    onConfirm={() => handleDelete(index)}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* 1st order field */}

              <Grid container spacing={2.5}>
                <Tooltip title="HS Code: 6–12 digits per code. Use commas for multiple values. Example: 841821, 841850, 842211">
                  <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                    {/* <SearchableMultiAutocomplete
                    name={`hblList.${hblIndex}.items.${index}.hsCode`}
                    label="HS Code"
                    values={getHsCodeList(
                      values.hblList[hblIndex]?.items?.[index],
                    )}
                    onSelectionChange={(selectedOptions) => {
                      const selectedCodes = selectedOptions
                        .map((opt) => String(opt?.hsCode || "").trim())
                        .filter(Boolean)
                        .slice(0, 40);
                      const selectedHsIds = selectedOptions
                        .slice(0, 40)
                        .map((opt) => String(opt?.id ?? "").trim())
                        .filter(Boolean);

                      setFieldValue(
                        `hblList.${hblIndex}.items.${index}.hsCode`,
                        selectedCodes,
                      );
                      setFieldValue(
                        `hblList.${hblIndex}.items.${index}.hsId`,
                        selectedHsIds,
                        false,
                      );
                    }}
                    onBlur={handleBlur}
                    options={hsCodeList}
                    loading={loading}
                    onSearch={hsCodeSearch}
                    getOptionLabelKey="hsCode"
                    getOptionValueKey="hsCode"
                    getOptionSearchKeys={["hsCodeName"]}
                    maxSelections={40}
                    required={isHsCodeRequired}
                    error={hasError(
                      `hblList[${hblIndex}].items[${index}].hsCode`,
                    )}
                    helperText={helperText(
                      `hblList[${hblIndex}].items[${index}].hsCode`,
                    )}
                  /> */}

                    {/* <FormikTextField
                      name={`hblList.${hblIndex}.items.${index}.hsCode`}
                      label="HS Code"
                      required={isHsCodeRequired}
                      onBlur={(e) => {
                        const cleaned = String(e.target.value ?? "")
                          .split(",")
                          .map((code) => code.trim())
                          .join(",");

                        setFieldValue(
                          `hblList.${hblIndex}.items.${index}.hsCode`,
                          cleaned,
                          false,
                        );

                        handleBlur(e);
                      }}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    /> */}
                    <FormikTextFieldWithPopup
                      name={`hblList.${hblIndex}.items.${index}.hsCode`}
                      label="HS Code"
                      popupTitle="HS Code"
                      required={isHsCodeRequired}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur: (e) => {
                          const cleaned = String(e.target.value ?? "")
                            .split(",")
                            .map((code) => code.trim())
                            .join(",");

                          setFieldValue(
                            `hblList.${hblIndex}.items.${index}.hsCode`,
                            cleaned,
                            false,
                          );
                          handleBlur(e);
                        },
                      }}
                    />
                  </Grid>
                </Tooltip>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  {/* <SearchableAutocomplete
                    name={`hblList.${hblIndex}.items.${index}.containerNo`}
                    label="Container Number"
                    value={
                      values.hblList[hblIndex]?.items?.[index]
                        ?.containerNo || ""
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={containerList}
                    loading={loading}
                    onSearch={handleMasterSearch({
                      type: "CONTAINER",
                      section: "itemDetails",
                      targetField: "containerList",
                    })}
                    getOptionLabelKey="containerName"
                    getOptionValueKey="containerName"
                    required
                    error={hasError(
                      `hblList[${hblIndex}].items[${index}].containerNo`,
                    )}
                    helperText={helperText(
                      `hblList[${hblIndex}].items[${index}].containerNo`,
                    )}
                  /> */}

                  <FormikMultiSelect
                    name={`hblList.${hblIndex}.items.${index}.containerNo`}
                    label="Container Number"
                    options={containerOptions}
                    required
                    maxSelections={hasSingleContainerOption ? 1 : undefined}
                    allowSelectAll={!hasSingleContainerOption}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikTextField
                    name={`hblList.${hblIndex}.items.${index}.numberOfPackages`}
                    label="No. of Packages"
                    // type="number"
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
                  <FormikPreloadedAutocomplete
                    name={`hblList.${hblIndex}.items.${index}.packageTypeName`}
                    label="Package Type"
                    options={packageTypeList}
                    loading={loading}
                    loadError={masterError}
                    onDropdownOpen={handlePreloadOpen({
                      type: "PACKAGE_TYPE",
                      section: "itemDetails",
                      targetField: "packageTypeList",
                      options: packageTypeList,
                    })}
                    required
                    getOptionLabelKey="name"
                    getOptionValueKey="name"
                    additionalFieldMappings={{ packageTypeId: "id" }}
                    getOptionDisplayLabel={(option) =>
                      option?.displayLabel || option?.note || option?.name || ""
                    }
                  />
                </Grid>

                {/* Cargo Gross Weight (KGM) */}

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Tooltip title="Example: 99999999999999.999 (numbers with up to 3 decimal places)">
                    <FormikTextField
                      name={`hblList.${hblIndex}.items.${index}.cargoGrossWeight`}
                      label="Cargo Gross Wt (KGM)"
                      // type="number"
                      required
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

                {/* Item Description */}
                <Tooltip title="Enter Item Description (512 characters)">
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormikTextFieldWithPopup
                      name={`hblList.${hblIndex}.items.${index}.itemDescription`}
                      label="Item Description"
                      popupTitle="Item Description"
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
                </Tooltip>

                {/* Marks & Numbers */}
                <Tooltip title="Enter Marks & Numbers (512 characters)">
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {/* <FormikTextField
                    name={`hblList.${hblIndex}.items.${index}.marksAndNumbers`}
                    label="Marks & Numbers"
                    type="text"
                    required
                    formik={{
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                    }}
                  /> */}

                    <FormikTextFieldWithPopup
                      name={`hblList.${hblIndex}.items.${index}.marksAndNumbers`}
                      label="Marks & Numbers"
                      popupTitle="Marks & Numbers"
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
                </Tooltip>

                {itemHasDangerousGoods && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Tooltip title="Enter exactly 4 digits">
                        <FormikTextField
                          name={`hblList.${hblIndex}.items.${index}.unCode`}
                          label="UN Code"
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
                      </Tooltip>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      {/* <FormikTextField
                        name={`hblList.${hblIndex}.items.${index}.imoClass`}
                        label="IMO Class"
                        required
                        formik={{
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                        }}
                      /> */}
                      <FormikSelect
                        name={`hblList.${hblIndex}.items.${index}.imoClass`}
                        label="IMO Class"
                        options={imoClassOptions}
                        required
                      />
                    </Grid>
                  </>
                )}

                {/* IMO Class */}
                {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikTextField
                    name={`hblList.${hblIndex}.items.${index}.imoClass`}
                    label="IMO Class"
                    required
                    formik={{
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                    }}
                  />
                </Grid> */}

                {/* UN Code */}
                {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormikTextField
                    name={`hblList.${hblIndex}.items.${index}.unCode`}
                    label="UN Code"
                    required
                    formik={{
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                    }}
                  />
                </Grid> */}
              </Grid>

              {/* Add View More / View Less Button */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  my: 2,
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
              </Box>
              <Grid container spacing={2.5}>
                {/* 2nd order field */}

                {expandedItems[index] && (
                  <>
                    {/* Marking Instructions */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      {/* <SearchableAutocomplete
                    name={`hblList.${hblIndex}.items.${index}.markingInstructions`}
                    label="Marking Instructions"
                    value={
                      values.hblList[hblIndex].items[index].markingInstructions
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={markingInstructionsOptions}
                  /> */}

                      <FormikPreloadedAutocomplete
                        name={`hblList.${hblIndex}.items.${index}.markingInstructionName`}
                        label="Marking Instructions"
                        options={markingInstructionList}
                        loading={loading}
                        loadError={masterError}
                        onDropdownOpen={handlePreloadOpen({
                          type: "MAKING_INSTRUCTION",
                          section: "itemDetails",
                          targetField: "markingInstructionList",
                          options: markingInstructionList,
                        })}
                        getOptionLabelKey="name"
                        getOptionValueKey="name"
                        additionalFieldMappings={{ markingInstructionId: "id" }}
                      />
                    </Grid>

                    {/* Packing Related Description Code */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormikPreloadedAutocomplete
                        name={`hblList.${hblIndex}.items.${index}.packingRelatedDescCode`}
                        label="Packing Desc Code"
                        options={packingDescCodeList}
                        loading={loading}
                        loadError={masterError}
                        onDropdownOpen={handlePreloadOpen({
                          type: "PACKING_DESC_CODE",
                          section: "itemDetails",
                          targetField: "packingDescCodeList",
                          options: packingDescCodeList,
                        })}
                        getOptionLabelKey="name"
                        getOptionValueKey="name"
                        additionalFieldMappings={{ packingDescriptionId: "id" }}
                      />
                    </Grid>

                    {/* Cargo Net Weight */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Tooltip title="Example: 99999999999999.999 (numbers with up to 3 decimal places)">
                        <FormikTextField
                          name={`hblList.${hblIndex}.items.${index}.cargoNetWeight`}
                          label="Cargo Net Wt (KGM)"
                          // type="number"
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

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormikTextField
                        name={`hblList.${hblIndex}.items.${index}.volumeMtq`}
                        label="Volume (MTQ)"
                        // type="number"
                        formik={{
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                        }}
                      />
                    </Grid>

                    {/* Country of Origin */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      {/* <SearchableAutocomplete
                        name={`hblList.${hblIndex}.items.${index}.countryOfOriginName`}
                        label="Country of Origin"
                        value={
                          values.hblList[hblIndex].items[index].countryOfOriginName
                        }
                        onChange={handleChange}
                        onBlur={handleBlur}
                        options={CountryOfOriginOptions}
                      /> */}
                      <SearchableAutocomplete
                        name={`hblList.${hblIndex}.items.${index}.countryOfOriginName`}
                        label="Country of Origin"
                        value={
                          values.hblList[hblIndex].items[index]
                            .countryOfOriginName
                        }
                        onChange={handleChange}
                        onBlur={handleBlur}
                        options={itemCountryList}
                        loading={loading}
                        onSearch={handleMasterSearch({
                          type: "COUNTRY",
                          section: "itemDetails",
                          targetField: "itemCountryList",
                        })}
                        getOptionLabelKey="countryName"
                        getOptionValueKey="countryName"
                        additionalFieldMappings={{ countryOfOriginId: "id" }}
                        error={hasError(
                          `hblList[${hblIndex}].items[${index}].countryOfOriginName`,
                        )}
                        helperText={helperText(
                          `hblList[${hblIndex}].items[${index}].countryOfOriginName`,
                        )}
                      />
                    </Grid>

                    {/* Remove Item? */}
                    {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FormikSelect
                        name={`hblList.${hblIndex}.items.${index}.removeItem`}
                        label="Remove Item?"
                        options={removedItemOptions}
                        required
                        formik={{
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                        }}
                      />
                    </Grid> */}
                  </>
                )}
              </Grid>
            </Paper>
          );
        })}
      </Box>

      {/* <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={handleAddItem}
          sx={{
            textTransform: "none",
            backgroundColor: themeDetails.buttonColor,
            "&:hover": { backgroundColor: themeDetails.buttonColor },
          }}
        >
          Add Item
        </Button>
      </Box> */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <ProgressButton
          label="Add Item"
          loadingStatus={addingItem}
          onClick={handleAddItemClick}
          icon={<AddIcon style={{ marginRight: 6 }} />}
          autoWidth
          color="#fff"
        />
      </Box>
    </Box>
  );
};

export default ItemDetailsTab;
