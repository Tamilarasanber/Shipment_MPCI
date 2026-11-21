import React, { useState, useCallback, useMemo } from "react";
import { getIn, useFormikContext } from "formik";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@/components/ui/mui";
import { AddIcon } from "@/components/ui/icons";
import ConfirmDeletePopover from "@/components/ui/ConfirmDeletePopover";
import { useDispatch, useSelector } from "react-redux";
import { fetchMpciMasterRequest } from "@/redux/actions/dubaiMpciAction";
import {
  ADDITIONAL_PARTY_OPTIONS,
  CONTACT_PARTY_TYPE_OPTIONS,
  QUALIFIER_OPTIONS,
} from "../../constants/selectOptions";
import {
  buildAutoFilledParty,
  dedupePartiesByType,
  EMPTY_SHIPMENT_PARTY_SUMMARY_INDEX,
} from "../../MapperLayer/partyAutofill";
import { FormikTextFieldWithPopup } from "@/components/ui/FormikFields";
import SearchableAutocomplete from "@/components/ui/SearchableAutocomplete";
import FormikPartyLookupAutocomplete from "../inputs/FormikPartyLookupAutocomplete";
import {
  FormikTextField,
  FormikSelect,
} from "@/components/ui/FormikFields";
import ProgressButton from "@/components/ui/ProgressButton";

const CONTACT_PARTY_TYPES_REQUIRING_DETAILS = ["INDIVIDUAL", "COMPANY"];
const PARTY_CORE_FIELDS = ["partyName", "address", "cityName", "countryName"];

/* ---------------- COMPONENT ---------------- */

const PartiesDetailsTab = ({ hblIndex }) => {
  //  console.log("parties re-render")
  const { themeDetails } = useSelector((state) => state.Theme);
  // const { cityList, stateList, countryList, loading } = useSelector(
  //   (state) => state.DubaiFormFiling,
  // );
  const { countryList, stateList, cityList, loading } = useSelector(
    (state) => state.DubaiFormFiling?.partiesDetails || {},
  );
  const { shipmentPartiesSummaries = EMPTY_SHIPMENT_PARTY_SUMMARY_INDEX } =
    useSelector((state) => state.DubaiFormFiling?.linkedHBLDetails || {});
  // Avoid duplicate for CityList
  const uniqueCities = useMemo(() => {
    return [
      ...new Map(
        (cityList || []).map((item) => [item.cityName, item]),
      ).values(),
    ];
  }, [cityList]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    submitCount,
  } = useFormikContext();
  const dispatch = useDispatch();

  const parties = values.hblList?.[hblIndex]?.parties || [];
  const currentHblNo = String(
    values.hblList?.[hblIndex]?.generalInfo?.hblNo || "",
  ).trim();
  const [selectedAdditionalParty, setSelectedAdditionalParty] = useState("");

  /* ---------- Add Party ---------- */
  const buildPartyFromShipmentSummary = useCallback(
    (partyType) =>
      buildAutoFilledParty(partyType, shipmentPartiesSummaries, currentHblNo),
    [currentHblNo, shipmentPartiesSummaries],
  );

  const handleAddParty = () => {
    if (!selectedAdditionalParty) return;

    setFieldValue(
      `hblList.${hblIndex}.parties`,
      dedupePartiesByType([
        ...parties,
        buildPartyFromShipmentSummary(selectedAdditionalParty),
      ]),
    );

    setSelectedAdditionalParty("");
  };

  // conditional logic for Additional Party dropdown
  const blType = values.hblList?.[hblIndex]?.generalInfo?.blType;

  const isConsigneeMandatory = blType === "Non-Negotiable";
  const isNegotiableBlType = blType === "Negotiable";
  const hasTextValue = (value) => Boolean(String(value ?? "").trim());
  const hasAnyCorePartyDetail = (party = {}) =>
    PARTY_CORE_FIELDS.some((field) => hasTextValue(party[field]));
  const isConsigneeFieldRequired = (party = {}) =>
    party.partyType !== "Consignee" ||
    !isNegotiableBlType ||
    hasAnyCorePartyDetail(party);

  //  const additionalPartyOptions = useMemo(() => {
  //     return ADDITIONAL_PARTY_OPTIONS.filter(
  //         return false;
  //       */ return !parties.some((p) => p.partyType === opt.value);
  //     });
  //   }, [parties]); */
  const additionalPartyOptions = useMemo(
    () =>
      ADDITIONAL_PARTY_OPTIONS.filter(
        (opt) => !parties.some((p) => p.partyType === opt.value),
      ),
    [parties],
  );

  const NON_DELETABLE_PARTIES = ["Shipper", "Forwarding Agent"];

  // disable add party btn
  const isAddPartyDisabled =
    !selectedAdditionalParty || additionalPartyOptions.length === 0;

  // disable delete action for default parties (Shipper, Forwarding Agent, and conditionally Consignee)
  const isDefaultParty = useCallback(
    (partyType) => {
      // Always default
      if (partyType === "Shipper") return true;
      if (partyType === "Forwarding Agent") return true;

      // Conditionally default
      if (partyType === "Consignee" && isConsigneeMandatory) {
        return true;
      }

      return false;
    },
    [isConsigneeMandatory],
  );

  /* ---------- Delete Party ---------- */

  const handleDeleteParty = (index) => {
    const party = parties[index];
    if (!party) return;
    if (NON_DELETABLE_PARTIES.includes(party.partyType)) return;

    if (isConsigneeMandatory && party.partyType === "Consignee") {
      return;
    }

    setFieldValue(
      `hblList.${hblIndex}.parties`,
      parties.filter((_, i) => i !== index),
    );
  };

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
  // Add Party with loading state
  const [addingParty, setAddingParty] = useState(false);
  const handleAddPartyClick = async () => {
    if (isAddPartyDisabled) return;

    try {
      setAddingParty(true);
      handleAddParty();
    } finally {
      setAddingParty(false);
    }
  };
  /* ---------- helpers (same as ItemDetailsTab) ---------- */
  const hasError = (field) =>
    Boolean((getIn(touched, field) || submitCount > 0) && getIn(errors, field));

  const helperText = (field) =>
    getIn(touched, field) || submitCount > 0 ? getIn(errors, field) || "" : "";

  return (
    <Box>
      <TableContainer
        sx={{
          maxHeight: "65vh",
          overflowX: "auto",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: 1200, //  important (adjust as per columns)
            tableLayout: "auto", //  stable layout
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Parties</TableCell>

              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Entity Name
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 280, // base width
                  maxWidth: 500, // optional safety
                }}
              >
                Address
              </TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>City</TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>State</TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Country
              </TableCell>
              <TableCell
                sx={{
                  minWidth: 280, // base width
                  maxWidth: 500, // optional safety
                }}
              >
                PO Box No
              </TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Tax ID
              </TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Qualifier
              </TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Identifier
              </TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Contact Name
              </TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Contact Party Type
              </TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Phone Number
              </TableCell>
              <TableCell sx={{ minWidth: 280, maxWidth: 500 }}>
                Email ID
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {parties.map((party, index) => {
              const base = `hblList.${hblIndex}.parties.${index}`;

              // conditional rendering
              const contactPartyTypeValue = getIn(
                values,
                `${base}.contactPartyType`,
              );
              const qualifierValue = getIn(values, `${base}.qualifier`);
              const identifierValue = getIn(values, `${base}.identifierNo`);
              const contactDetailValue = getIn(values, `${base}.contactDetail`);
              const mobileValue = getIn(values, `${base}.mobile`);
              const emailValue = getIn(values, `${base}.email`);

              const requiresContactDetails =
                party.partyType === "Consignee" &&
                CONTACT_PARTY_TYPES_REQUIRING_DETAILS.includes(
                  contactPartyTypeValue,
                );
              const hasContactDetail = hasTextValue(contactDetailValue);
              const hasMobile = hasTextValue(mobileValue);
              const hasEmail = hasTextValue(emailValue);
              const isContactDetailRequired =
                requiresContactDetails || hasMobile || hasEmail;
              const isContactPartyTypeRequired = hasContactDetail;
              const isContactMethodRequired =
                requiresContactDetails || hasContactDetail;
              const isQualifierIdentifierPairRequired =
                hasTextValue(qualifierValue) || hasTextValue(identifierValue);

              return (
                <TableRow key={party.id} hover>
                  <TableCell>
                    <Typography>{party.partyType}</Typography>
                  </TableCell>

                  <TableCell>
                    {/* <FormikTextField
                      name={`${base}.partyName`}
                      label="Entity Name"
                      required={isConsigneeFieldRequired(party)}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    /> */}

                    <FormikPartyLookupAutocomplete
                      name={`${base}.partyName`}
                      label="Entity Name"
                      required={isConsigneeFieldRequired(party)}
                      enableMultilineDialog
                      multilineDialogTitle="Entity Name"
                    />
                  </TableCell>

                  <TableCell>
                    {/* <FormikTextField
                      name={`${base}.address`}
                      label="Address"
                      required={isConsigneeFieldRequired(party)}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    /> */}
                    <FormikTextFieldWithPopup
                      name={`${base}.address`}
                      label="Address"
                      popupTitle="Address Details"
                      required={isConsigneeFieldRequired(party)}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {/* <SearchableAutocomplete
                      name={`${base}.cityName`}
                      label="City"
                      value={getIn(values, `${base}.cityName`) || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      options={uniqueCities}
                      loading={loading}
                      onSearch={handleMasterSearch({
                        type: "CITY",
                        section: "partiesDetails",
                        targetField: "cityList",
                      })}
                      getOptionLabelKey="cityName"
                      getOptionValueKey="cityName"
                      additionalFieldMappings={{ cityId: "id" }}
                      required={isConsigneeFieldRequired(party.partyType)}
                      error={hasError(`${base}.cityName`)}
                      helperText={helperText(`${base}.cityName`)}
                    /> */}
                    <FormikTextField
                      name={`${base}.cityName`}
                      label="City"
                      required={isConsigneeFieldRequired(party)}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {/* <SearchableAutocomplete
                      name={`${base}.stateName`}
                      label="State"
                      value={getIn(values, `${base}.stateName`) || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      // options={stateList}
                      options={stateList}
                      loading={loading}
                      onSearch={handleMasterSearch({
                        type: "STATE",
                        section: "partiesDetails",
                        targetField: "stateList",
                      })}
                      getOptionLabelKey="stateName"
                      getOptionValueKey="stateName"
                      additionalFieldMappings={{ stateId: "id" }}
                      required={isConsigneeFieldRequired(party.partyType)}
                      error={hasError(`${base}.stateName`)}
                      helperText={helperText(`${base}.stateName`)}
                    /> */}
                    <FormikTextField
                      name={`${base}.stateName`}
                      label="State"
                      // required={isConsigneeFieldRequired(party)}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <SearchableAutocomplete
                      name={`${base}.countryName`}
                      label="Country"
                      value={getIn(values, `${base}.countryName`) || null}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      options={countryList}
                      loading={loading}
                      onSearch={handleMasterSearch({
                        type: "COUNTRY",
                        section: "partiesDetails",
                        targetField: "countryList",
                      })}
                      getOptionLabelKey="countryName"
                      getOptionValueKey="countryName"
                      additionalFieldMappings={{ countryId: "id" }}
                      required={isConsigneeFieldRequired(party)}
                      error={hasError(`${base}.countryName`)}
                      helperText={helperText(`${base}.countryName`)}
                    />
                  </TableCell>

                  <TableCell>
                    <FormikTextField
                      name={`${base}.poBox`}
                      label="PO Box No"
                      // required={isConsigneeFieldRequired(party.partyType)}
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <FormikTextField
                      name={`${base}.taxID`}
                      label="Tax ID"
                      formik={{
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                      }}
                    />
                  </TableCell>

                  {party.partyType === "Consignee" ? (
                    <>
                      <TableCell>
                        {/* <FormikTextField
                          name={`${base}.qualifier`}
                          label="Qualifier"
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        /> */}
                        <FormikSelect
                          name={`${base}.qualifier`}
                          label="Qualifier"
                          options={QUALIFIER_OPTIONS}
                          required={isQualifierIdentifierPairRequired}
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <FormikTextField
                          name={`${base}.identifierNo`}
                          label="Identifier"
                          required={isQualifierIdentifierPairRequired}
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <FormikTextField
                          name={`${base}.contactDetail`}
                          label="Contact Name"
                          required={isContactDetailRequired}
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <FormikSelect
                          name={`${base}.contactPartyType`}
                          label="Contact Party Type"
                          options={CONTACT_PARTY_TYPE_OPTIONS}
                          required={isContactPartyTypeRequired}
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <FormikTextField
                          name={`${base}.mobile`}
                          label="Phone Number"
                          type="text"
                          inputProps={{ inputMode: "numeric", maxLength: 15 }}
                          required={isContactMethodRequired && !hasEmail}
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <FormikTextField
                          name={`${base}.email`}
                          label="Email ID"
                          required={isContactMethodRequired && !hasMobile}
                          formik={{
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                          }}
                        />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell colSpan={6} />
                    </>
                  )}

                  <TableCell>
                    {!isDefaultParty(party.partyType) && (
                      <ConfirmDeletePopover
                        message="Delete this party?"
                        onConfirm={() => handleDeleteParty(index)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Party */}
      {/* <Box mt={2} display="flex" gap={1}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Additional Party Type</InputLabel>
          <Select
            value={selectedAdditionalParty}
            label="Additional Party Type"
            onChange={(e) => setSelectedAdditionalParty(e.target.value)}
          >
            {additionalPartyOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddParty}
          disabled={isAddPartyDisabled}
          sx={{
            textTransform: "none",
            backgroundColor: isAddPartyDisabled
              ? "#cfcfcf"
              : themeDetails.buttonColor,
            color: isAddPartyDisabled ? "#6f6f6f" : "#fff",
            cursor: isAddPartyDisabled ? "not-allowed" : "pointer",
            "&:hover": {
              backgroundColor: isAddPartyDisabled
                ? "#cfcfcf"
                : themeDetails.buttonColor,
            },
          }}
        >
          Add Party
        </Button>
      </Box> */}
      {/* Add Party */}
      <Box mt={2} display="flex" gap={1} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Additional Party Type</InputLabel>
          <Select
            value={selectedAdditionalParty}
            label="Additional Party Type"
            onChange={(e) => setSelectedAdditionalParty(e.target.value)}
          >
            {additionalPartyOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ProgressButton
          label="Add Party"
          loadingStatus={addingParty}
          onClick={handleAddPartyClick}
          disabled={isAddPartyDisabled}
          icon={<AddIcon style={{ marginRight: 6 }} />}
          autoWidth
          color="#fff"
        />
      </Box>
    </Box>
  );
};

export default PartiesDetailsTab;
