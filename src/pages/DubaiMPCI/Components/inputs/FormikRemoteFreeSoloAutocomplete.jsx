import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { OpenInFullIcon } from "@/components/ui/icons";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@/components/ui/mui";
import { getIn, setIn, useField, useFormikContext } from "formik";

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const FormikRemoteFreeSoloAutocomplete = ({
  name,
  label,
  required = false,
  disabled = false,
  size = "small",
  minSearchLength = 2,
  options = [],
  loading = false,
  noOptionsText = "No matching options",
  minLengthText = "Type at least 2 characters",
  searchingText = "Searching...",
  getOptionLabel,
  getOptionKey,
  onSearch,
  onClear,
  mapOptionToFieldValues,
  clearRelatedFieldValues,
  enableMultilineDialog = false,
  multilineDialogTitle,
  multilineMinRows = 6,
  multilineMaxRows = 12,
  validateOnInput = false,
}) => {
  const [field, meta] = useField(name);
  const {
    setFieldTouched,
    setFieldValue,
    setValues,
    submitCount,
    validateField,
    validateForm,
    values,
  } = useFormikContext();
  const [inputValue, setInputValue] = useState(String(field.value ?? ""));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const didSkipInitialInputValidation = useRef(false);
  const debouncedInput = useDebounce(inputValue, 300);

  const shouldShowError = Boolean(
    (meta?.touched || submitCount > 0) && meta?.error,
  );

  const normalizedOptions = useMemo(() => {
    const uniqueOptions = new Map();

    (Array.isArray(options) ? options : []).forEach((option) => {
      const optionKey = getOptionKey(option);
      if (!optionKey || uniqueOptions.has(optionKey)) return;
      uniqueOptions.set(optionKey, option);
    });

    return Array.from(uniqueOptions.values());
  }, [getOptionKey, options]);

  const triggerValidation = useCallback(() => {
    setFieldTouched(name, true, false);
    validateField(name);
  }, [name, setFieldTouched, validateField]);

  const visibleOptions = useMemo(() => {
    return inputValue.trim().length >= minSearchLength ? normalizedOptions : [];
  }, [inputValue, minSearchLength, normalizedOptions]);

  useEffect(() => {
    setInputValue(String(field.value ?? ""));
  }, [field.value]);

  useEffect(() => {
    const searchText = String(debouncedInput || "").trim();

    if (searchText.length < minSearchLength) {
      onClear?.();
      return;
    }

    onSearch?.(searchText);
  }, [debouncedInput, minSearchLength, onClear, onSearch]);

  useEffect(() => () => onClear?.(), [onClear]);

  useEffect(() => {
    if (!validateOnInput) return;

    if (!didSkipInitialInputValidation.current) {
      didSkipInitialInputValidation.current = true;
      return;
    }

    setFieldTouched(name, true, false);
    validateField(name);
  }, [debouncedInput, name, setFieldTouched, validateField, validateOnInput]);

  const getSiblingFieldName = useCallback(
    (fieldName) => name.replace(/([^[.\]]+)$/, fieldName),
    [name],
  );

  const getCurrentRowValues = useCallback(() => {
    const parentPath = name.replace(/\.?([^[.\]]+)$/, "");
    return parentPath ? getIn(values, parentPath) : values;
  }, [name, values]);

  const applyFieldValues = useCallback(
    (fieldValues = {}, { validate = true } = {}) => {
      if (!fieldValues || typeof fieldValues !== "object") return;

      let didChange = false;
      let nextValues = values;

      for (const [key, value] of Object.entries(fieldValues)) {
        const siblingName = getSiblingFieldName(key);
        if (getIn(values, siblingName) === value) continue;

        nextValues = setIn(nextValues, siblingName, value);
        didChange = true;
      }

      if (!didChange) return;

      // A lookup fills several party fields at once. One atomic Formik update
      // avoids validating an intermediate, incomplete party row.
      void setValues(nextValues, false);

      if (validate) {
        setFieldTouched(name, true, false);
        // Validate the exact post-autofill snapshot so accordion completion
        // state and its tick update immediately without waiting for tab change.
        void validateForm(nextValues);
      }
    },
    [getSiblingFieldName, name, setFieldTouched, setValues, validateForm, values],
  );

  const clearLookupDerivedFields = useCallback(
    ({ validate = false } = {}) => {
      if (!clearRelatedFieldValues) return;

      applyFieldValues(
        clearRelatedFieldValues({
          name,
          currentValue: field.value,
          currentRowValues: getCurrentRowValues(),
          values,
        }),
        { validate },
      );
    },
    [
      applyFieldValues,
      clearRelatedFieldValues,
      field.value,
      getCurrentRowValues,
      name,
      values,
    ],
  );

  const applySelection = (option) => {
    applyFieldValues(
      mapOptionToFieldValues(option, {
        name,
        currentValue: field.value,
        currentRowValues: getCurrentRowValues(),
        values,
      }),
    );
  };

  const handleFreeSoloInputChange = useCallback(
    (newInputValue, { shouldClearLookupFields = true } = {}) => {
      setInputValue(newInputValue);
      void setFieldValue(name, newInputValue, false);

      if (shouldClearLookupFields) {
        clearLookupDerivedFields();
      }
    },
    [clearLookupDerivedFields, name, setFieldValue],
  );

  const closeMultilineDialog = useCallback(() => {
    setIsDialogOpen(false);
    triggerValidation();
  }, [triggerValidation]);

  const filterOptions = useCallback(
    (options, state) => {
      const searchText = state.inputValue.trim().toLowerCase();

      return options.filter((option) =>
        getOptionLabel(option).toLowerCase().startsWith(searchText),
      );
    },
    [getOptionLabel],
  );

  return (
    <>
      <Autocomplete
        freeSolo
        disableClearable
        fullWidth
        size={size}
        disabled={disabled}
        loading={loading}
        // options={normalizedOptions}
        options={visibleOptions}
        value={null}
        inputValue={inputValue}
        filterOptions={filterOptions}
        noOptionsText={
          inputValue.trim().length < minSearchLength
            ? minLengthText
            : loading
              ? searchingText
              : noOptionsText
        }
        getOptionLabel={(option) =>
          typeof option === "string" ? option : getOptionLabel(option)
        }
        isOptionEqualToValue={(option, value) =>
          getOptionKey(option) === getOptionKey(value)
        }
        onInputChange={(_, newInputValue, reason) => {
          if (reason === "reset") return;

          if (reason === "input") {
            handleFreeSoloInputChange(newInputValue);
          }

          if (reason === "clear") {
            handleFreeSoloInputChange(newInputValue);
            onClear?.();
          }
        }}
        onChange={(_, newValue) => {
          if (typeof newValue === "string") {
            setFieldValue(name, newValue, false);
            clearLookupDerivedFields({ validate: true });
            return;
          }

          if (!newValue) {
            setFieldValue(name, "", false);
            onClear?.();
            clearLookupDerivedFields({ validate: true });
            return;
          }

          applySelection(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={
              <>
                {label}
                {required && (
                  <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>
                )}
              </>
            }
            error={shouldShowError}
            helperText={shouldShowError ? meta?.error : ""}
            onBlur={() => setFieldTouched(name, true, true)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {enableMultilineDialog && !disabled && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label={`Open ${label} multiline editor`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <OpenInFullIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": {
                minHeight: 40,
              },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
            }}
          />
        )}
      />

      {enableMultilineDialog && (
        <Dialog
          open={isDialogOpen}
          onClose={closeMultilineDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{multilineDialogTitle || label}</DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              multiline
              minRows={multilineMinRows}
              maxRows={multilineMaxRows}
              margin="dense"
              name={name}
              label={label}
              value={inputValue}
              disabled={disabled}
              onChange={(event) => handleFreeSoloInputChange(event.target.value)}
              onBlur={() => setFieldTouched(name, true, true)}
              autoFocus
              sx={{
                "& .MuiInputBase-input": {
                  padding: "12px 14px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                },
              }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={closeMultilineDialog}>Cancel</Button>
            <Button variant="contained" onClick={closeMultilineDialog}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default memo(FormikRemoteFreeSoloAutocomplete);
