import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, Checkbox, Chip, TextField } from "./mui";

const useDebounce = (value, delay = 250) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const SearchableMultiAutocompleteBase = ({
  name,
  label,
  values = [],
  onSelectionChange,
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
  getOptionSearchKeys = [],
  maxSelections = 40,
  limitTags = 2,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [limitError, setLimitError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const onSearchRef = useRef(onSearch);
  const lastDispatchedQueryRef = useRef("");

  const debouncedInput = useDebounce(inputValue, 250);
  const MIN_SEARCH_LENGTH = 2;
  const selectedValues = Array.isArray(values) ? values.filter(Boolean) : [];

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (!onSearchRef.current) return;

    const normalizedQuery = String(debouncedInput || "").trim();

    if (normalizedQuery.length >= MIN_SEARCH_LENGTH) {
      const queryKey = normalizedQuery.toLowerCase();
      if (queryKey === lastDispatchedQueryRef.current) return;

      lastDispatchedQueryRef.current = queryKey;
      setHasSearched(true);
      onSearchRef.current(normalizedQuery);
    } else {
      setHasSearched(false);
      lastDispatchedQueryRef.current = "";
    }
  }, [debouncedInput]);

  const normalizedOptions = useMemo(() => {
    const apiOptions = Array.isArray(options) ? options : [];
    const optionMap = new Map();

    apiOptions.forEach((opt) => {
      const key = String(opt?.[getOptionValueKey] ?? "");
      if (!key) return;
      optionMap.set(key, opt);
    });

    selectedValues.forEach((val) => {
      const key = String(val ?? "");
      if (!key || optionMap.has(key)) return;
      optionMap.set(key, {
        [getOptionLabelKey]: key,
        [getOptionValueKey]: key,
      });
    });

    return Array.from(optionMap.values());
  }, [options, selectedValues, getOptionLabelKey, getOptionValueKey]);

  const selectedOptions = useMemo(() => {
    const selectedSet = new Set(selectedValues.map((v) => String(v)));
    return normalizedOptions.filter((opt) =>
      selectedSet.has(String(opt?.[getOptionValueKey] ?? "")),
    );
  }, [normalizedOptions, selectedValues, getOptionValueKey]);
  const selectedValueSet = useMemo(
    () => new Set(selectedValues.map((value) => String(value))),
    [selectedValues],
  );

  const noOptionsText = (() => {
    if (!inputValue || inputValue.length < MIN_SEARCH_LENGTH) {
      return "Please search";
    }
    if (loading) return "Searching...";
    if (hasSearched && normalizedOptions.length === 0) return "No options";
    return "";
  })();

  const resolveOptionDisplayLabel = (option) => {
    if (typeof option === "string") {
      return option;
    }

    return option?.displayLabel || option?.[getOptionLabelKey] || "";
  };
  const resolveSelectedOptionLabel = (option) => {
    if (typeof option === "string") {
      return option;
    }

    return option?.[getOptionLabelKey] || option?.displayLabel || "";
  };
  const normalizedSearchKeys = useMemo(() => {
    const customKeys = Array.isArray(getOptionSearchKeys)
      ? getOptionSearchKeys
      : [];

    return Array.from(
      new Set(
        [getOptionLabelKey, ...customKeys]
          .map((key) => String(key || "").trim())
          .filter(Boolean),
      ),
    );
  }, [getOptionLabelKey, getOptionSearchKeys]);

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      fullWidth
      size={size}
      value={selectedOptions}
      options={normalizedOptions}
      filterOptions={(options, { inputValue }) => {
        const search = String(inputValue || "").trim().toLowerCase();

        return options.filter((opt) => {
          return normalizedSearchKeys.some((key) => {
            const candidate =
              key === getOptionLabelKey
                ? resolveOptionDisplayLabel(opt)
                : String(opt?.[key] ?? "");

            return candidate.toLowerCase().startsWith(search);
          });
        });
      }}
      loading={loading}
      disabled={disabled}
      inputValue={inputValue}
      noOptionsText={noOptionsText}
      limitTags={limitTags}
      getOptionLabel={(option) => resolveOptionDisplayLabel(option)}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });

          return (
            <Chip
              key={key}
              label={resolveSelectedOptionLabel(option)}
              size="small"
              {...tagProps}
            />
          );
        })
      }
      isOptionEqualToValue={(option, val) =>
        String(option?.[getOptionValueKey]) === String(val?.[getOptionValueKey])
      }
      onChange={(_, newSelectedOptions) => {
        if (newSelectedOptions.length > maxSelections) {
          setLimitError(`Maximum ${maxSelections} selections allowed`);
          return;
        }

        setLimitError("");
        onSelectionChange?.(newSelectedOptions);

        setInputValue("");

        lastDispatchedQueryRef.current = "";
      }}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === "input") {
          setInputValue(newInputValue);
          return;
        }

        if (reason === "clear") {
          setInputValue("");
          lastDispatchedQueryRef.current = "";
          return;
        }

        if (reason === "reset") return;
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        const optionValue = String(option?.[getOptionValueKey] ?? "");
        return (
          <li key={key} {...rest}>
            <Checkbox
              checked={selectedValueSet.has(optionValue)}
              size="small"
              sx={{ mr: 1 }}
            />
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
              {required && <span style={{ color: "red" }}> *</span>}
            </>
          }
          placeholder={placeholder}
          onBlur={onBlur}
          error={Boolean(error || limitError)}
          helperText={limitError || helperText}
          sx={{
            "& .MuiInputBase-root": {
              minHeight: 40, // ✅ initial height
              height: "auto", // ✅ allow expand
              alignItems: "center", // default center
            },

            // 🔥 when multiple chips → top align
            // "& .MuiInputBase-root.MuiAutocomplete-inputRoot": {
            //   alignItems: "flex-start",
            //   paddingTop: "4px",
            //   paddingBottom: "4px",
            // },

            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
              },
            },
          }}
        />
      )}
    />
  );
};

const SearchableMultiAutocomplete = memo(
  SearchableMultiAutocompleteBase,
  (prevProps, nextProps) =>
    prevProps.name === nextProps.name &&
    prevProps.label === nextProps.label &&
    prevProps.values === nextProps.values &&
    prevProps.onSelectionChange === nextProps.onSelectionChange &&
    prevProps.onBlur === nextProps.onBlur &&
    prevProps.options === nextProps.options &&
    prevProps.onSearch === nextProps.onSearch &&
    prevProps.loading === nextProps.loading &&
    prevProps.required === nextProps.required &&
    prevProps.error === nextProps.error &&
    prevProps.helperText === nextProps.helperText &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.size === nextProps.size &&
    prevProps.getOptionLabelKey === nextProps.getOptionLabelKey &&
    prevProps.getOptionValueKey === nextProps.getOptionValueKey &&
    prevProps.getOptionSearchKeys === nextProps.getOptionSearchKeys &&
    prevProps.maxSelections === nextProps.maxSelections &&
    prevProps.limitTags === nextProps.limitTags,
);

export default SearchableMultiAutocomplete;
