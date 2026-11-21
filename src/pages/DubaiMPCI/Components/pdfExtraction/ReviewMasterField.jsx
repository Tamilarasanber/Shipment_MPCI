import { memo, useCallback, useMemo, useState } from "react";
import { Box, InputAdornment, Tooltip } from "@/components/ui/mui";
import { CheckCircleOutlineIcon } from "@/components/ui/icons";
import { WarningAmberOutlinedIcon } from "@/components/ui/icons";
import { useDispatch, useSelector } from "react-redux";
import SearchableAutocomplete from "@/components/ui/SearchableAutocomplete";
import {
  fetchMpciMasterRequest,
  updatePdfReviewMasterField,
} from "@/redux/actions/dubaiMpciAction";
import {
  MASTER_FIELD_CONFIG,
  buildClearedMasterField,
  buildMasterSeedOption,
  buildSelectedMasterField,
  isMasterInSync,
  masterNeedsAttention,
  resolveMasterOptionDisplayLabel,
} from "../../pdfExtraction/reviewModel";

const EMPTY_OPTIONS = [];

const SYNC_BORDER = "#2e7d32";
const ATTENTION_BORDER = "#ed6c02";

// Master-bound field for the PDF review form.
//
// Backend extract API already resolves masters — we do NOT call master APIs on load.
// - MATCHED: show value from `field.matched` (seed option, no API).
// - Not synced: show extracted text + in-field amber icon; master API runs when user types.
const ReviewMasterField = ({
  fileId,
  fieldKey,
  label,
  field,
  basePath,
  required = false,
  error = false,
  helperText = "",
  disabled = false,
  onBlur,
}) => {
  const dispatch = useDispatch();
  const [userHasSearched, setUserHasSearched] = useState(false);

  const config = MASTER_FIELD_CONFIG[fieldKey] || {};
  const { type, section, targetField, labelKey = "label" } = config;

  const reduxOptions = useSelector(
    (state) =>
      state.DubaiFormFiling?.[section]?.[targetField] ?? EMPTY_OPTIONS,
  );
  const loading = useSelector((state) =>
    userHasSearched
      ? Boolean(state.DubaiFormFiling?.[section]?.loading)
      : false,
  );

  const seedOption = useMemo(
    () => buildMasterSeedOption(field, labelKey),
    [field, labelKey],
  );

  const options = userHasSearched
    ? reduxOptions
    : seedOption
      ? [seedOption]
      : EMPTY_OPTIONS;

  const value = field?.value ?? "";
  const inSync = isMasterInSync(field);
  const needsAttention = masterNeedsAttention(field, { isMandatory: required });

  const statusAdornment = useMemo(() => {
    if (inSync) {
      return (
        <InputAdornment position="end">
          <Tooltip title="Synced with master data">
            <CheckCircleOutlineIcon sx={{ color: SYNC_BORDER, fontSize: 18 }} />
          </Tooltip>
        </InputAdornment>
      );
    }

    if (needsAttention) {
      return (
        <InputAdornment position="end">
          <Tooltip title="Not synced with master — search and select from the list">
            <WarningAmberOutlinedIcon
              sx={{ color: ATTENTION_BORDER, fontSize: 18 }}
            />
          </Tooltip>
        </InputAdornment>
      );
    }

    return null;
  }, [inSync, needsAttention]);

  const inputSx = useMemo(() => {
    if (error) return undefined;
    if (inSync) {
      return {
        "& .MuiOutlinedInput-root fieldset": {
          borderColor: `${SYNC_BORDER} !important`,
        },
      };
    }
    if (needsAttention) {
      return {
        "& .MuiOutlinedInput-root fieldset": {
          borderColor: `${ATTENTION_BORDER} !important`,
        },
      };
    }
    return undefined;
  }, [error, inSync, needsAttention]);

  const handleSearch = useCallback(
    (text) => {
      if (!section || !targetField || !text || text.length < 2) return;
      setUserHasSearched(true);
      dispatch(
        fetchMpciMasterRequest({ type, searchText: text, section, targetField }),
      );
    },
    [dispatch, section, targetField, type],
  );

  const handleChange = useCallback(
    (event) => {
      const segment = event?.target?.name;
      if (segment === "id") return;

      const nextValue = event?.target?.value ?? "";
      if (!nextValue) {
        dispatch(
          updatePdfReviewMasterField({
            id: fileId,
            basePath,
            field: buildClearedMasterField(field),
          }),
        );
        return;
      }

      const selectedOption =
        options.find(
          (option) =>
            String(option?.[labelKey] ?? "") === String(nextValue) ||
            String(option?.displayLabel ?? "") === String(nextValue),
        ) || seedOption;

      dispatch(
        updatePdfReviewMasterField({
          id: fileId,
          basePath,
          field: buildSelectedMasterField(selectedOption, labelKey),
        }),
      );
    },
    [basePath, dispatch, field, fileId, labelKey, options, seedOption],
  );

  return (
    <Box>
      <SearchableAutocomplete
        name="value"
        label={label}
        value={value}
        options={options}
        loading={loading}
        onSearch={handleSearch}
        disablePrefillSearch
        required={required}
        error={error}
        helperText={helperText}
        disabled={disabled}
        getOptionLabelKey={labelKey}
        getOptionValueKey={labelKey}
        getOptionDisplayLabel={(option) =>
          resolveMasterOptionDisplayLabel(option, labelKey)
        }
        additionalFieldMappings={{ id: "id" }}
        onChange={handleChange}
        onBlur={onBlur}
        statusAdornment={statusAdornment}
        inputSx={inputSx}
      />
    </Box>
  );
};

export default memo(ReviewMasterField);
