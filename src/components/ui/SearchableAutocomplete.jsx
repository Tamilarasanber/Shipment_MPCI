import { useState, useEffect, useRef } from "react";
import { TextField, Autocomplete } from "./mui";

// Debounce Hook
const useDebounce = (value, delay = 200) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const SearchableAutocomplete = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  onSearch,
  loading = false,
  required = false,
  error = false,
  helperText = "",
  disabled = false,
  placeholder = "",
  size = "small",
  getOptionLabelKey = "label",
  getOptionValueKey = "value",
  getOptionDisplayLabel,
  getOptionDisplayLabelKey,
  renderCustomOption,
  additionalFieldMappings = {},
  disablePrefillSearch = false,
  statusAdornment = null,
  inputSx,
}) => {
  const [inputValue, setInputValue] = useState("");

  const debouncedInput = useDebounce(inputValue, 200);

  const MIN_SEARCH_LENGTH = 2;

  const [hasSearched, setHasSearched] = useState(false);
  const onSearchRef = useRef(onSearch);
  const isUserTypingRef = useRef(false);
  const lastPrefillSeedRef = useRef("");
  const stringValue = value === null || value === undefined ? "" : String(value);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Trigger search when debounced input changes and meets length requirement
  useEffect(() => {
    if (!onSearchRef.current) return;
    if (!isUserTypingRef.current) return;

    if (debouncedInput.length >= MIN_SEARCH_LENGTH) {
      setHasSearched(true);
      onSearchRef.current(debouncedInput);
    } else {
      setHasSearched(false);
    }
  }, [debouncedInput]);

  // Prefilled values (edit mode): search once per value change.
  // Prevent re-search loops when shared Redux options are replaced by another field/row.
  useEffect(() => {
    if (disablePrefillSearch) return;
    if (!onSearchRef.current) return;
    if (!value) {
      lastPrefillSeedRef.current = "";
      return;
    }

    const seed = stringValue;
    if (seed.length < MIN_SEARCH_LENGTH) return;
    if (seed === lastPrefillSeedRef.current) return;
    lastPrefillSeedRef.current = seed;
    const alreadyMatched = options.some(
      (opt) =>
        String(opt?.[getOptionValueKey]) === seed ||
        String(opt?.[getOptionLabelKey]) === seed,
    );
    if (alreadyMatched) return;

    setHasSearched(true);
    onSearchRef.current(seed);
  }, [
    value,
    stringValue,
    options,
    getOptionValueKey,
    getOptionLabelKey,
    disablePrefillSearch,
  ]);

  const noOptionsText = (() => {
    if (!inputValue || inputValue.length < MIN_SEARCH_LENGTH) {
      return "Please search";
    }

    if (loading) {
      return "Searching...";
    }

    if (hasSearched && options.length === 0) {
      return "No options";
    }

    return "";
  })();

  const selectedOption = value
    ? options.find(
        (opt) =>
          String(opt?.[getOptionValueKey]) === stringValue ||
          String(opt?.[getOptionLabelKey]) === stringValue,
      ) || null
    : null;
  const shouldShowOptions =
    inputValue.length >= MIN_SEARCH_LENGTH || Boolean(selectedOption);
  
  const visibleOptions = shouldShowOptions ? options : [];

  const resolveMappedFieldName = (targetFieldName) => {
    if (
      targetFieldName.includes(".") ||
      targetFieldName.includes("[")
    ) {
      return targetFieldName;
    }

    return name.replace(/([^[.\]]+)$/, targetFieldName);
  };

  const updateMappedFields = (option) => {
    Object.entries(additionalFieldMappings).forEach(
      ([targetFieldName, optionKey]) => {
        onChange({
          target: {
            name: resolveMappedFieldName(targetFieldName),
            value: option ? option?.[optionKey] ?? "" : "",
          },
        });
      },
    );
  };
  const triggerFieldBlur = (fieldName = name) => {
    if (typeof onBlur !== "function") {
      return;
    }

    setTimeout(() => {
      onBlur({
        target: {
          name: fieldName,
        },
      });
    }, 0);
  };

  const resolveOptionDisplayLabel = (option) => {
    if (typeof option === "string") {
      return option;
    }

    if (typeof getOptionDisplayLabel === "function") {
      return getOptionDisplayLabel(option);
    }

    if (getOptionDisplayLabelKey) {
      return option?.[getOptionDisplayLabelKey] || "";
    }

    return option?.displayLabel || option?.[getOptionLabelKey] || "";
  };

  const handleChange = (event, newValue) => {
    isUserTypingRef.current = false;

    if (!newValue) {
      onChange({
        target: { name, value: "" },
      });
      updateMappedFields(null);
      triggerFieldBlur(name);
      return;
    }

    // Keep the rich display label visible immediately after selection.
    setInputValue(resolveOptionDisplayLabel(newValue));

    onChange({
      target: {
        name,
        value: newValue[getOptionValueKey],
      },
    });
    updateMappedFields(newValue);
    triggerFieldBlur(name);
  };

  // Sync input only from external formik value updates, not while user typing.
  useEffect(() => {
    if (isUserTypingRef.current) return;

    const nextDisplay = selectedOption
      ? resolveOptionDisplayLabel(selectedOption)
      : stringValue;

    setInputValue(nextDisplay || "");
  }, [stringValue, selectedOption, getOptionDisplayLabel, getOptionDisplayLabelKey, getOptionLabelKey]);

  return (
    <Autocomplete
      size={size}
      value={null}
      onChange={handleChange}
      inputValue={inputValue}
      noOptionsText={noOptionsText}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === "input") {
          isUserTypingRef.current = true;
          setInputValue(newInputValue);

          if (stringValue) {
            onChange({
              target: { name, value: "" },
            });
            updateMappedFields(null);
            lastPrefillSeedRef.current = "";
          }

          return;
        }

        if (reason === "clear") {
          isUserTypingRef.current = false;
          setInputValue("");
          onChange({
            target: { name, value: "" },
          });
          updateMappedFields(null);
          return;
        }

        if (reason === "reset") {
          // Keep typing mode when Formik value is still empty; otherwise
          // async option refresh can clear input and collapse the list.
          if (selectedOption || stringValue) {
            isUserTypingRef.current = false;
          }
          return;
        }
      }}
      options={visibleOptions}
      getOptionLabel={(option) =>
        resolveOptionDisplayLabel(option)
      }
      isOptionEqualToValue={(option, val) =>
        String(option?.[getOptionValueKey]) ===
          String(val?.[getOptionValueKey]) ||
        String(option?.[getOptionLabelKey]) ===
          String(val?.[getOptionLabelKey])
      }
      loading={loading}
      disabled={disabled}
      fullWidth
      renderOption={(props, option) => {
        if (renderCustomOption) {
          return renderCustomOption(props, option);
        }

        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            {resolveOptionDisplayLabel(option)}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={
            <>
              {label}
              {/* {required ?? (
                <span style={{ color: "red" }}> *</span>
              )} */}
               {required && (
                <span style={{ color: "red" }}> *</span>
              ) 
              // : (
              //   <span style={{ color: "#64748B", marginLeft: 6, fontSize: 12 }}>
              //     (Optional)
              //   </span>
              // )
              }
            </>
          }
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          onBlur={onBlur}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {statusAdornment}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            ...(inputSx || {}),
            "& .MuiInputBase-root": {
              height: 40,
              ...(inputSx?.["& .MuiInputBase-root"] || {}),
            },
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
              },
              ...(inputSx?.["& .MuiOutlinedInput-root"] || {}),
            },
          }}
        />
      )}
    />
  );
};

export default SearchableAutocomplete;
