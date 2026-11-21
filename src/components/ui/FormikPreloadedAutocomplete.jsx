import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Autocomplete, TextField } from "./mui";
import { useField, useFormikContext } from "formik";

const buildSearchText = (
  option,
  getOptionLabelKey,
  getOptionValueKey,
  getOptionDisplayLabel,
  getOptionDisplayLabelKey,
) => {
  if (!option || typeof option === "string") {
    return String(option ?? "").toLowerCase();
  }

  const displayText =
    typeof getOptionDisplayLabel === "function"
      ? getOptionDisplayLabel(option)
      : getOptionDisplayLabelKey
        ? option?.[getOptionDisplayLabelKey]
        : option?.displayLabel;

  return [
    displayText,
    option?.[getOptionLabelKey],
    option?.[getOptionValueKey],
    option?.agentCode,
    option?.agentName,
    option?.name,
    option?.note,
    option?.description,
  ]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean)
    .join(" ");
};

const FormikPreloadedAutocomplete = ({
  name,
  label,
  options = [],
  loading = false,
  required = false,
  disabled = false,
  placeholder = "",
  size = "small",
  getOptionLabelKey = "label",
  getOptionValueKey = "value",
  getOptionDisplayLabel,
  getOptionDisplayLabelKey,
  additionalFieldMappings = {},
  renderCustomOption,
  onDropdownOpen,
  loadError = "",
}) => {
  const [field, meta] = useField(name);
  const { setFieldTouched, setFieldValue, submitCount, validateField } =
    useFormikContext();
  const [inputValue, setInputValue] = useState("");
  const deferredInputValue = useDeferredValue(inputValue);
  const hasTriggeredOpenRef = useRef(false);
  const hasMarkedTouchedRef = useRef(false);

  const normalizedOptions = useMemo(
    () => (Array.isArray(options) ? options : []),
    [options],
  );

  const shouldShowError = Boolean(
    (meta?.touched || submitCount > 0) && meta?.error,
  );

  const stringValue =
    field.value === null || field.value === undefined ? "" : String(field.value);

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

  const selectedOption = stringValue
    ? normalizedOptions.find((option) => {
        const optionValue = String(option?.[getOptionValueKey] ?? "");
        const optionLabel = String(option?.[getOptionLabelKey] ?? "");

        return optionValue === stringValue || optionLabel === stringValue;
      }) || null
    : null;

  const filteredOptions = useMemo(() => {
    const query = String(deferredInputValue ?? "").trim().toLowerCase();
    if (!query) return normalizedOptions;

    return normalizedOptions.filter((option) =>
      buildSearchText(
        option,
        getOptionLabelKey,
        getOptionValueKey,
        getOptionDisplayLabel,
        getOptionDisplayLabelKey,
      ).includes(query),
    );
  }, [
    deferredInputValue,
    normalizedOptions,
    getOptionLabelKey,
    getOptionValueKey,
    getOptionDisplayLabel,
    getOptionDisplayLabelKey,
  ]);

  useEffect(() => {
    const nextDisplay = selectedOption
      ? resolveOptionDisplayLabel(selectedOption)
      : stringValue;

    setInputValue(nextDisplay || "");
  }, [selectedOption, stringValue]);

  const resolveMappedFieldName = (targetFieldName) => {
    if (targetFieldName.includes(".") || targetFieldName.includes("[")) {
      return targetFieldName;
    }

    return name.replace(/([^[.\]]+)$/, targetFieldName);
  };

  const updateMappedFields = (option) => {
    Object.entries(additionalFieldMappings).forEach(
      ([targetFieldName, optionKey]) => {
        setFieldValue(
          resolveMappedFieldName(targetFieldName),
          option ? option?.[optionKey] ?? "" : "",
          false,
        );
      },
    );
  };
  const triggerFieldValidation = (fieldName = name) => {
    setTimeout(() => {
      setFieldTouched(fieldName, true, false);
      validateField(fieldName);
    }, 0);
  };
  const markFieldTouched = (fieldName = name) => {
    if (hasMarkedTouchedRef.current) return;
    hasMarkedTouchedRef.current = true;
    triggerFieldValidation(fieldName);
  };

  const triggerDropdownOpen = () => {
    if (hasTriggeredOpenRef.current) return;
    hasTriggeredOpenRef.current = true;
    onDropdownOpen?.();
  };

  useEffect(() => {
    if (!loading) {
      hasTriggeredOpenRef.current = false;
    }
  }, [loading]);

  return (
    <Autocomplete
      size={size}
      value={selectedOption}
      options={filteredOptions}
      loading={loading}
      disabled={disabled}
      inputValue={inputValue}
      fullWidth
      noOptionsText={
        loadError || (loading ? "Loading..." : "No options available")
      }
      getOptionLabel={(option) => resolveOptionDisplayLabel(option)}
      isOptionEqualToValue={(option, value) =>
        String(option?.[getOptionValueKey] ?? "") ===
          String(value?.[getOptionValueKey] ?? "") ||
        String(option?.[getOptionLabelKey] ?? "") ===
          String(value?.[getOptionLabelKey] ?? "")
      }
      onChange={(_, newValue) => {
        setFieldValue(
          name,
          newValue ? newValue?.[getOptionValueKey] ?? "" : "",
          false,
        );
        updateMappedFields(newValue);
        triggerFieldValidation(name);
      }}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === "input") {
          markFieldTouched(name);
          setInputValue(newInputValue);
          return;
        }

        if (reason === "clear") {
          setInputValue("");
          setFieldValue(name, "", false);
          updateMappedFields(null);
          triggerFieldValidation(name);
        }
      }}
      onOpen={triggerDropdownOpen}
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
          name={field.name}
          label={
            <>
              {label}
              {required && (
                <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>
              )}
            </>
          }
          placeholder={placeholder}
          onBlur={(event) => {
            field.onBlur(event);
            triggerFieldValidation(name);
          }}
          onFocus={triggerDropdownOpen}
          error={shouldShowError}
          helperText={shouldShowError ? meta?.error : ""}
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
  );
};

export default memo(FormikPreloadedAutocomplete);
