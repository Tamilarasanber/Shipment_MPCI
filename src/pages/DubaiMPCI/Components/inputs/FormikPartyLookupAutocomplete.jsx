import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMpciPartyLookup,
  fetchMpciPartyLookupRequest,
} from "@/redux/actions/dubaiMpciAction";
import {
  getPartyLookupOptionKey,
  mapPartyLookupResponseToPartyFormValues,
} from "../../MapperLayer/partyLookupMapper";
import FormikRemoteFreeSoloAutocomplete from "./FormikRemoteFreeSoloAutocomplete";

const FormikPartyLookupAutocomplete = ({
  name,
  label,
  required = false,
  disabled = false,
  size = "small",
  enableMultilineDialog = false,
  multilineDialogTitle,
  multilineMinRows,
  multilineMaxRows,
  validateOnInput = true,
}) => {
  const dispatch = useDispatch();

  const lookupState = useSelector(
    (state) => state.DubaiFormFiling?.partyLookup?.byField?.[name] || {},
  );

  const handleSearch = useCallback(
    (partyName) =>
      dispatch(
        fetchMpciPartyLookupRequest({
          fieldName: name,
          partyName,
        }),
      ),
    [dispatch, name],
  );

  const handleClear = useCallback(
    () => dispatch(clearMpciPartyLookup({ fieldName: name })),
    [dispatch, name],
  );

  return (
    <FormikRemoteFreeSoloAutocomplete
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      size={size}
      options={lookupState.options || []}
      loading={Boolean(lookupState.loading)}
      getOptionLabel={(option) => option?.partyName || ""}
      getOptionKey={getPartyLookupOptionKey}
      onSearch={handleSearch}
      onClear={handleClear}
      mapOptionToFieldValues={mapPartyLookupResponseToPartyFormValues}
      enableMultilineDialog={enableMultilineDialog}
      multilineDialogTitle={multilineDialogTitle}
      multilineMinRows={multilineMinRows}
      multilineMaxRows={multilineMaxRows}
      validateOnInput={validateOnInput}
    />
  );
};

export default memo(FormikPartyLookupAutocomplete);
